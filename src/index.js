const express = require('express');
const app = express();
app.use(express.json());
const axios = require("axios");
const clientes = {};
contador = 0;

const funcoes = {
    ClienteClassificada: (cliente) => {
        console.log("Entrou no Cliente Classificada")
            clientes[cliente.contador].status = cliente.status;
        axios.post('http://localhost:10000/eventos', {
            tipo: "ClienteCriado",
            dados: {
                contador: cliente.contador,
                nome: cliente.nome,
                endereco: cliente.endereco,
                idade: cliente.idade,
                status: cliente.status,
                quantIngressos: cliente.quantIngressos
            }
        });
    },
    ClienteComIngressos: (dados) =>{
        console.log("Entrou no Cliente Classificada")
        clientes[dados.id].quantIngressos = dados.quant;
    }
}
app.post('/eventos', (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (e) {}
    res.status(200).send({ msg: "ok" });
});

app.get('/clientes', (req, res) => {
    res.send(clientes);
});
app.post('/clientes', async(req, res) => {
    contador++;
    const {
        nome,
        endereco,
        idade
    } = req.body;
    clientes[contador] = {
        contador,
        nome,
        endereco,
        idade,
        status: "aguardando",
        quantIngressos: 0
    };
    console.log('ClienteParaClassificar');
    await axios.post("http://localhost:10000/eventos", {
        tipo: "ClienteParaClassificar",
        dados: {
            contador,
            nome,
            endereco,
            idade,
            status: "aguardando",
            quantIngressos: 0
        }
    });
    res.status(201).send(clientes[contador]);
});
app.put('/clientes/:id', (req, res) => {
    const idAlterar = req.params.id;
    const {
        nome,
        endereco,
        idade
    } = req.body;
    cliente = clientes[idAlterar];
    clientes[idAlterar] = {
        contador: cliente.contador,
        nome: nome!=null?nome : cliente.nome,
        endereco: endereco !=null? endereco: cliente.endereco,
        idade: idade != null? idade: cliente.idade,
        status: "aguardando",
        quantIngressos: cliente.quantIngressos
    }
    cliente2 = clientes[idAlterar];
    axios.post("http://localhost:10000/eventos", {
        tipo: "ClienteParaClassificar",
        dados: {
            contador: cliente2.contador,
            nome: cliente2.nome,
            endereco: cliente2.endereco,
            idade: cliente2.idade,
            status: "aguardando",
            quantIngressos: cliente2.quantIngressos
        }
    });
    res.status(200).json(clientes);
})
app.delete('/clientes/:id', (req, res) => {
    const idDeletar = req.params.id;
    delete clientes[idDeletar];
    axios.post("http://localhost:10000/eventos", {
        tipo: "ClienteDeletado",
        dados: idDeletar
    });
    res.status(200).json(clientes);
});
app.listen(4000, () => {
    console.log('Clientes. Porta 4000');
});