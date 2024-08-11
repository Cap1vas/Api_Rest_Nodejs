import express from 'express';
import pool from '../mysql.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import login from "../middleware/login.js";

const router = express.Router();

dotenv.config();

router.post('/cadastro', (req, res) => {
    const { nome_usuario, data_de_nascimento, cep, tarefas_id_tarefas, email, senha } = req.body;

    if (!nome_usuario || !email || !senha) {
        return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
    }

    bcrypt.hash(senha, 10, (errBcrypt, hash) => {
        if (errBcrypt) {
            console.error('Erro ao criptografar a senha:', errBcrypt);
            return res.status(500).json({ mensagem: 'Erro ao criptografar a senha' });
        }

        const query = `INSERT INTO usuarios(nome_usuario, data_de_nascimento, cep, tarefas_id_tarefas, email, senha) 
                       VALUES(?, ?, ?, ?, ?, ?)`;
        const values = [nome_usuario, data_de_nascimento, cep, tarefas_id_tarefas, email, hash];

        pool.getConnection((err, conn) => {
            if (err) {
                console.error('Erro ao obter conexão:', err);
                return res.status(500).json({ mensagem: 'Erro ao obter conexão' });
            }

            conn.query(query, values, (errQuery, result) => {
                conn.release();

                if (errQuery) {
                    console.error('Erro ao executar a query:', errQuery);
                    return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
                }

                res.status(201).json({
                    mensagem: 'Usuário criado',
                    id_usuario: result.insertId
                });
            });
        });
    });
});

router.post('/login', (req, res) => {
    pool.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM usuarios WHERE email = ?`;
        conn.query(query, [req.body.email], (error, results) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ mensagem: "Falha na autenticação" })
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: "Falha na autenticação" })
                }
                if (result) {
                    const token = jwt.sign({
                        id_usuarios: results[0].id_usuarios,  // Verifique se este valor é um número
                        email: results[0].email,
                        nome_usuario: results[0].nome_usuario
                    }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    });

                    return res.status(200).send({
                        mensagem: "Autenticado com sucesso!",
                        token: token
                    });
                }
                return res.status(401).send({ mensagem: "Falha na autenticação" });
            });
        });
    });
});

router.get('/', (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Erro ao obter conexão:', err);
            return res.status(500).json({ mensagem: 'Erro ao obter conexão' });
        }

        conn.query('SELECT * FROM usuarios', (errQuery, resultado) => {
            conn.release(); // Libera a conexão de volta ao pool

            if (errQuery) {
                console.error('Erro ao executar a query:', errQuery);
                return res.status(500).json({ mensagem: 'Erro ao obter usuários' });
            }

            res.status(200).json({ response: resultado });
        });
    });
});

router.get('/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Erro ao obter conexão:', err);
            return res.status(500).json({ mensagem: 'Erro ao obter conexão' });
        }

        conn.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario], (errQuery, resultado) => {
            conn.release(); // Libera a conexão de volta ao pool

            if (errQuery) {
                console.error('Erro ao executar a query:', errQuery);
                return res.status(500).json({ mensagem: 'Erro ao obter usuário' });
            }

            if (resultado.length === 0) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado' });
            }

            res.status(200).json({ response: resultado });
        });
    });
});

router.patch('/:id_usuarios', login, (req, res, next) => {
    const { nome_usuario, data_de_nascimento, cep, tarefas_id_tarefas } = req.body;
    const { id_usuarios } = req.params;


    if (!nome_usuario) {
        return res.status(400).json({ mensagem: 'O campo nome_usuario é obrigatório.' });
    }


    if (parseInt(id_usuarios) !== req.userId) {
        return res.status(403).json({ mensagem: 'Você não tem permissão para atualizar este usuário.' });
    }

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Erro ao obter conexão:', err);
            return res.status(500).json({ mensagem: 'Erro ao obter conexão' });
        }

        conn.query(
            `UPDATE usuarios 
                SET nome_usuario = ?, 
                    data_de_nascimento = ?, 
                    cep = ?, 
                    tarefas_id_tarefas = ? 
            WHERE id_usuarios = ?`,
            [nome_usuario, data_de_nascimento, cep, tarefas_id_tarefas, id_usuarios],
            (errQuery, result) => {
                conn.release();

                if (errQuery) {
                    console.error('Erro ao executar a query:', errQuery);
                    return res.status(500).json({ mensagem: 'Erro ao atualizar usuário' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
                }

                res.status(202).json({ mensagem: 'Usuário atualizado', id_usuarios });
            }
        );
    });
});

router.delete('/:id_usuarios', login, (req, res) => {
    const { id_usuarios } = req.params;


    if (parseInt(id_usuarios) !== req.userId) {
        return res.status(403).json({ mensagem: 'Você não tem permissão para deletar este usuário.' });
    }

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Erro ao obter conexão:', err);
            return res.status(500).json({ mensagem: 'Erro ao obter conexão' });
        }

        conn.query('DELETE FROM usuarios WHERE id_usuarios = ?', [id_usuarios], (errQuery, result) => {
            conn.release();

            if (errQuery) {
                console.error('Erro ao executar a query:', errQuery);
                return res.status(500).json({ mensagem: 'Erro ao deletar usuário' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado' });
            }

            res.status(202).json({ mensagem: 'Usuário deletado', id_usuarios });
        });
    });
});


export default router;
