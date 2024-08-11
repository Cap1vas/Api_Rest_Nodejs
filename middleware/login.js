import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

console.log(process.env.JWT_KEY)
const login = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.usuario = decoded;
        req.userId = decoded.id_usuarios;
        req.userData = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ mensagem: "Token inválido!" });

    }
};


export default login;
