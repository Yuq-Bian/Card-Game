const express = require('express');
const path = require('path');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use("/files", express.static('./files/'));

app.get('/', (req, res) => {
    res.render('gd');
})



app.listen(3000, ()=> {
    console.log('3000 Serving');
})