// ---------->>>>>>> filtering through page , name , featured -true , false

const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  //   throw new Error("testing async errors");
  // page: "2" 

  // const search = 'a'
  // let products = await Product.find({}).sort('-name price') ;

  let products = await Product.find({price: {$gt:30}})
  .sort('price')
  .select('name price').limit(30);
  res.status(200).json({ products, nbHits: products.length });
};


const getAllProducts = async (req, res) => {
  const {featured , company, name, sort,fields, numericFilters}  = req.query 
  const queryObject = {}

  if(featured){
      queryObject.featured = featured === 'true'? true : false
  }
  if(company){  
    // if company exists than setup obj
    queryObject.company = company
  }
  if(name){
    queryObject.name = name
  }
  if(numericFilters){
    const operatorMap = {
        '>':'$gt',
        '>=':'$gte',
        '=':'$eq',
        '<':'$lt',
        '<=':'$lte',
    }

    const regEx = /\b(<|>|>=|=|<|<=)\b/g
    let filters = numericFilters.replace(
      regEx, 
      (match)=> `-${operatorMap[match]}-` )

      const options = ['price' , 'rating']
      filters = filters.split(',').forEach((item) =>{
        const [field , operator, value ] = item.split('-')

        if(options,includes(field)){
            queryObject[field] = {  [operator]: Number(value) }
        }

      }) 

    console.log(filters);
  }
    console.log(queryObject);
  // const products = await Product.find(queryObject); // as per featured true or false in postman
    let result = Product.find(queryObject)

    // sort 
  if(sort){
    // products = products.sort()
    // console.log(sort);
    const sortList = sort.split(',').join(' ')
    result = result.sort(sortList)
  }
  else{
    result = result.sort('createAt')
  }

  if(fields){
    const fieldsList = fields.split(',').join(' ')
    result = result.select(fieldsList)

  } 

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  // const skip = (page - 1) * limit 

  // result = result*skip(skip).limit(limit)

  const products = await result
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = { getAllProducts, getAllProductsStatic };
