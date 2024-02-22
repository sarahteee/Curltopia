const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

//DB values
//const dbUrl = "mongodb://localhost:27017/curltopia";
const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}`;
const client = new MongoClient(dbUrl);

const app = express();
const port = process.env.PORT || "8888";

//SET UP TEMPLATE ENGINE (PUG)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//STATIC FILES PATH SETUP
app.use(express.static(path.join(__dirname, "public")));

//SET UP FOR EASIER FORM DATA PARSING
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//INDEX PAGE ROUTE SETUP
app.get("/", (request, response) => {
    response.render("index", { title: "Home" });
});

//SIGNUP PAGE ROUTE SETUP
app.get("/signup", (request, response) => {
    response.render("signup", { title: "Sign Up" });
});

//SHOP PAGE ROUTE SETUP
app.get("/shop", async (request, response) => {
    let shopProducts = await getProducts();
    console.log(shopProducts);

    response.render("shop", { title: "Shop", items: shopProducts });
});

//ADMIN PAGES
app.get("/admin/shop", async (request, response) => {
    let shopProducts = await getProducts();
    response.render("admin-create", { title: "Administer Menu", items: shopProducts });
});

app.get("/admin/shop/add/submit", async (request, response) => {
    let shopProducts = await getProducts();
    response.render("create", { title: "Add New Product", items: shopProducts });
});

//ADMIN FORM PROCESSING PATHS
app.post("/admin/shop/add/submit", async (request, response) => {
    //for POST data, retrieve field data using request.body.<field-name>
    let ProductName = request.body.productName;
    let ProductPrice = request.body.price;
    let ProductType = request.body.type;
    let ProductImage = request.body.image;
    let newProduct = {
        "productName": ProductName,
        "price": ProductPrice,
        "type": ProductType,
        "image": ProductImage
    };
    await addProduct(newProduct);
    response.redirect("/admin/shop");
    //console.log(ProductName);
})

app.get("/admin/shop/delete", async (request, response) => {
    //get product id
    let id = request.query.productId;

    await deleteProduct(id);
    response.redirect("/admin/shop")
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
});

//MONGODB FUNCTIONS
async function connection() {
    db = client.db("curltopia");
    return db;
}

//Function to select all documents in curltopia collection
async function getProducts() {
    db = await connection();
    let results = db.collection("products").find({});
    let res = await results.toArray();
    return res;
}

//Function to insert a product
async function addProduct(productData) {
    db = await connection();
    let status = await db.collection("products").insertOne(productData)
}

//Function to delete a product
async function deleteProduct(id) {
    db = await connection();
    const deleteId = { _id: new ObjectId(id) };
    const result = await db.collection("products").deleteOne(deleteId);
    if (result.deletedCount == 1)
        console.log("delete complete");
}
