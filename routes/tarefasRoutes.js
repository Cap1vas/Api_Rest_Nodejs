import express from "express";
import pool from "../mysql.js";

const router = express.Router();


router.get('/', (req, res, next) => {
    pool.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query('SELECT * FROM tarefas', (error, resultado, fields) => {
            conn.release();
            if (error) {
                return res.status(500).send({ error: error, response: null });
            }
            return res.status(200).send({ response: resultado });
        });
    });
});


router.post('/', (req, res, next) => {
    const tarefa = {
        nome_tarefa: req.body.nome_tarefa,
        tipo: req.body.tipo
    };

    pool.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error, response: null });
        }

        conn.query(
            'INSERT INTO tarefas(nome_tarefa, tipo) VALUES(?, ?)',
            [tarefa.nome_tarefa, tarefa.tipo],
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error, response: null });
                }
                res.status(201).send({
                    message: "Tarefa criada",
                    id_tarefas: resultado.insertId
                });
            }
        );
    });
});


router.get('/:id_tarefas', (req, res, next) => {
    pool.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query('SELECT * FROM tarefas WHERE id_tarefas = ?;', [req.params.id_tarefas], (error, resultado, fields) => {
            conn.release();
            if (error) {
                return res.status(500).send({ error: error, response: null });
            }
            return res.status(200).send({ response: resultado });
        });
    });
});

// PATCH atualizar uma tarefa
router.patch('/:id_tarefas', (req, res, next) => {
    const id_tarefas = req.params.id_tarefas;
    const tarefa = {
        nome_tarefa: req.body.nome_tarefa,
        tipo: req.body.tipo
    };

    pool.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error, response: null });
        }

        conn.query(
            `UPDATE tarefas 
            SET nome_tarefa = ?, 
                tipo = ?
            WHERE id_tarefas = ?`,
            [tarefa.nome_tarefa, tarefa.tipo, id_tarefas],
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error, response: null });
                }
                if (resultado.affectedRows === 0) {
                    return res.status(404).send({ message: "Tarefa não encontrada" });
                }
                res.status(202).send({
                    message: "Tarefa atualizada",
                    id_tarefas: id_tarefas
                });
            }
        );
    });
});


router.delete('/:id_tarefas', (req, res, next) => {
    const id_tarefas = req.params.id_tarefas;

    pool.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error, response: null });
        }

        conn.query(
            'DELETE FROM tarefas WHERE id_tarefas = ?',
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error, response: null });
                }
                if (resultado.affectedRows === 0) {
                    return res.status(404).send({ message: "Tarefa não encontrada" });
                }
                res.status(202).send({
                    message: "Tarefa deletada",
                    id_tarefas: id_tarefas
                });
            }
        );
    });
});

export default router;
