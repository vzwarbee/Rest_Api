const bodyParser = require('body-parser');
const express = require('express');
const dbConnect = require('./config/dbConnect');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 6868;
const authRouter = require("./router/authRouter");
const cookieParser = require("cookie-parser")
const productRouter = require("./router/productRouter")
const blogRouter = require("./router/blogRouter");
const prodCategoryRouter = require("./router/prodCategoryRouter");
const blogCategoryRouter = require("./router/blogCategoryRouter");
const brandRouter = require("./router/brandRouter");
const couponRouter = require("./router/couponRouter");
const morgan = require("morgan")
dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/prodCategory', prodCategoryRouter);
app.use('/api/blogCategory', blogCategoryRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/brand', brandRouter);


app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => {
    console.log("Server is running at PORT " + PORT);
})