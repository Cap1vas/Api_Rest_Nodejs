import express from "express";
import rotasUsuario from '#userRoutes';
import rotasTarefa from '#tarefasRoutes';
import morgan from "morgan";
import bodyParser from "body-parser";

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Origin, X-Requested-With, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }

    next();
});

app.use('/usuarios', rotasUsuario);
app.use('/tarefas', rotasTarefa);

//n encontra rota
app.use((req, res, next) => {
    const erro = new Error('nao encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    return res.send({ message: error.message })
});

app.use('/', (req, res, next) => {
    res.status(200).send('Bora porra!')
});





export default app;