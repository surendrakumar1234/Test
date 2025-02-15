require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const nodemailer = require("nodemailer");
// const courses = require("./courses.json");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve("./public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", (req, res) => {
  const value = req.query.value;
  res.render("index", {
    value,
  });
});

/* RZP Integration START */

const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

app.post("/pay", (req, res) => {
  try {
    const { email, phone, password, course, actualPrice } = req.body;

    // Email code START

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kumargabu382@gmail.com",
        pass: "wqrz pvms kiec uwyw",
      },
    });

    var mailOptions = {
      from: "kumargabu382@gmail.com",
      to: "skchoudhary992889@gmail.com",
      subject: "New Req.",
      html: `
    <center><h3>New Req.</h3></center>

    <table class="table">
  <thead>
    <tr>
        <th>Email: </th>
        <td>${email}</td>
    </tr>
  </thead>
  <tbody>
    <tr>
        <th>Phone: </th>
        <td>${phone}</td>
    </tr>
    <tr>
        <th>Password: </th>
        <td>${password}</td>
    </tr>
    <tr>
        <th>Course: </th>
        <td>${course}</td>
    </tr>
    <tr>
        <th>PaidPrice: </th>
        <td>${actualPrice / 2}</td>
      </tr>
  </tbody>
</table>
      `,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("email sent" + info.response);
      }
    });

    // Email code END

    const amount = Math.ceil(actualPrice / 2) * 100;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "razorUser@gmail.com",
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          key_id: RAZORPAY_ID_KEY,
          product_name: course,
          description: course,
          contact: "99999999",
          name: "Hrithik",
          email: email,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
});

/* RZP Integration END */
const port = process.env.port || 8000
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
