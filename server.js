
const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(__dirname));

app.post(
  "/api/analisar",
  express.raw({
    type: "image/jpeg",
    limit: "4mb"
  }),
  async (req, res) => {
    try {
      const endpoint = process.env.CUSTOM_VISION_URL;
      const apiKey = process.env.CUSTOM_VISION_KEY;

      if (!endpoint || !apiKey) {
        return res.status(500).json({
          erro: "Custom Vision não configurado no Azure."
        });
      }

      if (!Buffer.isBuffer(req.body) || !req.body.length) {
        return res.status(400).json({
          erro: "Imagem inválida."
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Prediction-Key": apiKey
        },
        body: req.body
      });

      if (!response.ok) {
        console.error(
          "Erro Custom Vision:",
          response.status
        );

        return res.status(502).json({
          erro: "Falha na API do Custom Vision.",
          codigo: response.status
        });
      }

      const data = await response.json();
      return res.json(data);

    } catch (error) {
      console.error("Erro na análise:", error.message);

      return res.status(500).json({
        erro: "Erro interno ao analisar imagem."
      });
    }
  }
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Visão EPI executando na porta ${PORT}`);
});
