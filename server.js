const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3030;

// Middleware per parsejar el cos de les sol·licituds a JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connecta't a MongoDB
mongoose.connect('mongodb+srv://1rdedam:12345@cluster0.jrpeb.mongodb.net/Biblioteca', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('Error connecting to MongoDB:', err));

// Definició del model de dades per a Llibre
const llibreSchema = new mongoose.Schema({
  isbn: String,
  titol: String,
  autor: String,
  anyPublicacio: Number,
  generes: [String],
  descripcio: String,
  paraulesClau: [String],
  dataAfegit: { type: Date, default: Date.now },
  estat: String,
  user: String,
  prestec: Date
});

const Llibre = mongoose.model('Llibre', llibreSchema);

// Ruta POST per afegir un nou llibre (/add)
app.post('/add', async (req, res) => {
  // Verificar i omplir valors per defecte si cal
  if (!req.body.titol || !req.body.autor) {
    req.body.titol = req.body.titol || "Sense títol";
    req.body.autor = req.body.autor || "Desconegut";
  }

  try {
    const llibre = new Llibre({
      isbn: req.body.isbn,
      titol: req.body.titol,
      autor: req.body.autor,
      anyPublicacio: req.body.anyPublicacio,
      generes: req.body.generes || [],
      descripcio: req.body.descripcio,
      paraulesClau: req.body.paraulesClau || [],
      estat: req.body.estat,
      user: req.body.user,
      prestec: req.body.prestec
    });
    await llibre.save();
    res.status(201).json(llibre);
  } catch (err) {
    res.status(400).json({ message: 'Error creating llibre', error: err.message });
  }
});

// Ruta GET per obtenir tots els llibres (/list)
app.get('/list', async (req, res) => {
  try {
    const llibres = await Llibre.find();
    res.status(200).json(llibres);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching llibres', error: err.message });
  }
});

// Ruta GET per obtenir llibres per rang de dates (/list/:dataini/:datafi)
app.get('/list/:dataini/:datafi', async (req, res) => {
  try {
    const dataInici = new Date(req.params.dataini);
    const dataFi = new Date(req.params.datafi);
    dataFi.setHours(23, 59, 59, 999); // Estableix fins al final del dia

    const llibres = await Llibre.find({
      dataAfegit: {
        $gte: dataInici,
        $lte: dataFi
      }
    });
    res.status(200).json(llibres);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching llibres by date range', 
      error: err.message 
    });
  }
});

// Ruta GET per obtenir un llibre per ID
app.get('/llibres/:id', async (req, res) => {
  try {
    const llibre = await Llibre.findById(req.params.id);
    if (!llibre) {
      return res.status(404).json({ message: 'Llibre not found' });
    }
    res.status(200).json(llibre);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching llibre', error: err.message });
  }
});

// Ruta PUT per actualitzar un llibre
app.put('/llibres/:id', async (req, res) => {
  try {
    const llibre = await Llibre.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    if (!llibre) {
      return res.status(404).json({ message: 'Llibre not found' });
    }
    res.status(200).json(llibre);
  } catch (err) {
    res.status(400).json({ message: 'Error updating llibre', error: err.message });
  }
});

// Ruta DELETE per eliminar un llibre
app.delete('/llibres/:id', async (req, res) => {
  try {
    const llibre = await Llibre.findByIdAndDelete(req.params.id);
    if (!llibre) {
      return res.status(404).json({ message: 'Llibre not found' });
    }
    res.status(200).json({ message: 'Llibre deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting llibre', error: err.message });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});