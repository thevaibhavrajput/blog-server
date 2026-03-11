const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const app = express();
const connection = require('./database/connection');
const cors = require('cors');
connection();

const blogPostRouter = require('./routes/blogPostRoute');
const commentRoute = require('./routes/commentRoute');
const authRoute = require('./routes/authRoute');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/blog', blogPostRouter);
app.use('/comment', commentRoute);
app.use('/auth', authRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

