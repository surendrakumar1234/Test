const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const fs = require("fs");
const express = require("express");
const app = express();
app.get("/",(req,res)=>{
  checkBhaskarAndSendMail();
  res.send("hello");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`your app started at http://localhost:${PORT}`);
});

function checkBhaskarAndSendMail() {
  axios
    .get("https://www.bhaskar.com")
    .then((res) => {
      const html = res.data;
      let links = [];
      const $ = cheerio.load(html);
      $("#root").each((index, element) => {
        let name = $(element)
          .find("div:nth-child(3)")
          .find("div:nth-child(2)")
          .find("div:nth-child(1)")
          .find("div:nth-child(2)>ul")
          .find("div:nth-child(1)")
          .find("div:nth-child(1)>li")
          .find("a:nth-child(1)>div>figure>picture>img")
          .attr("src");

        name = $(element)
          .find("div:nth-child(3)")
          .find("div:nth-child(2)")
          .find("div:nth-child(1)")
          .find("div:nth-child(2)>ul")
          .find("div:nth-child(1)")
          .find("div:nth-child(1)>li")
          .find("a:nth-child(1)")
          .attr("href")
          .trim();

        name = name.split("/");
        console.log(name[2]);
        if (name[2] !== "news") {
          name = name[1] + "/" + name[2] + "/video/" + name[4] + "?type=video";
        }
        // console.log("https://www.bhaskar.com/" + name);
        if (name[2] === "news") {
          name = name[1] + "/video/" + name[3] + "?type=video";
        } else if (name[4] === "news") {
          name =
            name[1] +
            "/" +
            name[2] +
            name[3] +
            "/video/" +
            name[5] +
            "?type=video";
        }
        // console.log("https://www.bhaskar.com/" + name);
        axios
          .get("https://www.bhaskar.com/" + name)
          .then((res) => {
            const $ = cheerio.load(res.data);

            let vidUrl = [];
            vidUrl.push(JSON.parse($("script").get()[6].children[0].data));

            // console.log(vidUrl[0].embedUrl);

            fs.readFile("./vidUrl.json", "utf-8", (err, data) => {
              if (err) {
                console.log(err);
              } else {
                let fsReadedVid = JSON.parse(data);
                // console.log("fsReadedVid", fsReadedVid[0].embedUrl);

                if (
                  fsReadedVid[0].embedUrl === vidUrl[0].embedUrl ||
                  !fsReadedVid[0].embedUrl
                ) {
                  console.log("new video not available");
                } else {




                  console.log("new video available");

                  fs.writeFile("vidUrl.json", JSON.stringify(vidUrl), (err) => {
                    if (err) {
                      console.error(err);
                    } else {
                    }
                  });
                }
              }
            });
          })
          .catch(() => {
            console.log("video axios err");
          });
      });
    })

    .catch(() => {
      console.log("axios err");
    });
}

// setInterval(checkBhaskarAndSendMail, 5000);
// checkBhaskarAndSendMail();

