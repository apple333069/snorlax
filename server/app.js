// 第三方模块 
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const multer  = require('multer')
const fs = require("fs")
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const jwt = require('jsonwebtoken')


// 數據庫連接池
var pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "j222700475",
  port: 3306,
  connectionLimit: 20,
  database: "snorlax"
})
// web伺服器監聽 8080 端口
var server = express();  
server.listen(5050);
// 跨域 cors 

server.use(cors({
  origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
  // 每請求是否驗證true
  credentials: true, 
}))

server.use(express.static("public/images"))

// 驗證token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

// 功能:完成用戶登入
server.get("/login", (req, res) => {
  // 接收客戶端傳遞數據:uname、upwd
  var data = req.query;
  console.log(data)
  var sql = "SELECT id FROM snorlax_login WHERE uname = ? AND upwd = md5(?)";
  pool.query(sql, [data.user, data.pass], (err, result) => {
    if (err) throw err;
    if (result.length == 1) {
      jwt.sign({data}, 'secretkey',(err, token) =>{
        res.send({ 
          code: 1, 
          msg: "登入成功",
          token
        });
      });
    } else {
      res.send({ code: -1, msg: "用戶名或密碼有誤" })
    }
  });
})


// 功能:商品分頁顯示
server.get("/products", (req, res) => {
  var pno = req.query.pno;  // 頁碼
  var ps = req.query.pagesize;  // 顯示數量
  var kw = req.query.keyword;  
  
  var sql = "SELECT product_id, product_img, product_name, product_describe, category, price, created_at FROM snorlax_product LIMIT ?,?";
  var offset = (pno - 1) * ps;
  ps = parseInt(ps);
  pool.query(sql, [offset, ps], (err, result) => {
    if (err) throw err;
    var sqlTotal = "SELECT COUNT(*) as total from snorlax_product";
    pool.query(sqlTotal, (err, among) => {
      if (err) {
        res.send({ code: -3, msg: "查詢失敗" });
      } else {
        let total = among[0]['total'] //查詢表中的數量
        res.send({
          code: 1, 
          msg: "查詢成功",
          data: result,
          total: total
        });
      }
    })    
  })
})
  // //模糊查詢
  // if(kw){
  //   var kws=kw.split(" ");
  //   kws.forEach((elem,i,arr)=>{
  //     arr[i]=`title like '%${elem}%'`;
  //   })
  //   var where=kws.join(" and ");
  //   var kwSql=`select * from snorlax_product where ${where}`;
  //   query(kwSql,[])
  //   .then(result=>{
  //     total=result.length;
  //     data.pageCount=
  //       Math.ceil(total/ps);
  //     sql+=` limit ?,?`;
  //     return query(sql,[ps*pno,ps]);
  //   })
  //   .then(result=>{
  //     data.data=result;
  //     res.send(output);
  //   })
  // }
// })

// 後台商品
// 後台添加商品
server.post("/addCrmProduct", jsonParser, (req, res) => {
  var data = req.body.params;
  created_at = '2022-01-23';
  var sql = "INSERT INTO snorlax_product (product_id,product_img,product_name, product_describe, price, category, created_at) VALUES(null, ?, ?, ?, ?, ?, ?)";
  pool.query(sql, [data.product_img,data.product_name, data.product_describe, data.price, data.category, created_at],(err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "商品添加成功" });
    } else {
      res.send({ code: -2, msg: "商品添加失敗" });
    }
  })
})
// 後台編輯取得商品
server.get("/getProduct", (req, res) => {
  var data = req.query;
  // console.log('data',data)
  var sql = "SELECT product_id, product_name, product_describe, category, price FROM snorlax_product WHERE product_id = ?";
  pool.query(sql, [data.id], (err, result) => {
    if (err) throw err;
    res.send({ code: 1, msg: "查詢成功", data: result })
  })
})
// 後台編輯商品
server.patch("/editCrmProduct", jsonParser, (req, res) => {
  var data = req.body.params;
  console.log('data',data)
  var sql = "UPDATE snorlax_product SET product_name=? , product_describe=?, category=?, price=? WHERE product_id=?";
  pool.query(sql, [data.product_name, data.product_describe, data.category, data.price, data.product_id], (err, result) => {
    if (err) throw err;
    res.send({ code: 1, msg: "修改成功", data: result })
  })
})

// 後台刪除商品
server.delete("/deleteProduct", (req, res) => {
  var data = req.query;

  var sql = "DELETE FROM snorlax_product WHERE product_id = ?";
  pool.query(sql, [data.id], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "刪除成功" });
    } else {
      res.send({ code: -1, msg: "刪除失敗" });
    }
  })
})
// 圖片存檔
server.post(
  "/upload",
  multer({
    //設置文件儲存路徑
    dest: "public/images",
  }).array("file", 1),
  function (req, res, next) {
    let files = req.files;
    let file = files[0];
    let fileInfo = {};
    let path = "public/images/" + Date.now().toString() + "_" + file.originalname;
    fs.renameSync("./public/images/" + file.filename, path);
    //获取文件基本信息
    fileInfo.type = file.mimetype;
    fileInfo.name = file.originalname;
    fileInfo.size = file.size;
    fileInfo.path = path;
    res.json({
      code: 200,
      msg: "OK",
      data: fileInfo,
    });
  }
);

// 後台用戶
// 功能:用戶分頁顯示
server.get("/users", (req, res) => {
  var pno = req.query.pno;  // 頁碼
  var ps = req.query.pagesize;  // 顯示數量
   
  var sql = "SELECT user_id, user_img, user_name, gender, birthday, phone, user_address, created_at FROM snorlax_user LIMIT ?,?";
  var offset = (pno - 1) * ps;
  ps = parseInt(ps);
  pool.query(sql, [offset, ps], (err, result) => {
    if (err) throw err;
    var sqlTotal = "SELECT COUNT(*) as total from snorlax_user";
    pool.query(sqlTotal, (err, among) => {
      if (err) {
        res.send({ code: -3, msg: "查詢失敗" });
      } else {
        let total = among[0]['total'] //查詢表中的數量
        res.send({
          code: 1, 
          msg: "查詢成功",
          data: result,
          total: total
        });
      }
    })    
  })
})

// 後台刪除用戶
server.delete("/deleteUser", (req, res) => {
  var data = req.query;

  var sql = "DELETE FROM snorlax_user WHERE user_id = ?";
  pool.query(sql, [data.id], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "刪除成功" });
    } else {
      res.send({ code: -1, msg: "刪除失敗" });
    }
  })
})

// 後台編輯取得用戶
server.get("/getUser", (req, res) => {
  var data = req.query;
  // console.log('data',data)
  var sql = "SELECT user_id, user_name, gender, birthday, phone, user_address FROM snorlax_user WHERE user_id = ?";
  pool.query(sql, [data.id], (err, result) => {
    if (err) throw err;
    res.send({ code: 1, msg: "查詢成功", data: result })
  })
})

// 後台編輯用戶
server.patch("/editCrmUser", jsonParser, (req, res) => {
  var data = req.body.params;
  console.log('data',data)
  var sql = "UPDATE snorlax_user SET user_name=? , gender=?, birthday=?, phone=? ,user_address=? WHERE user_id=?";
  pool.query(sql, [data.user_name, data.gender, data.birthday, data.phone, data.user_address, data.user_id], (err, result) => {
    if (err) throw err;
    res.send({ code: 1, msg: "修改成功", data: result })
  })
})
