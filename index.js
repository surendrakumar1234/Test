const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const fs = require("fs");

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
        name = name[1] + "/" + name[2] + "/video/" + name[4] + "?type=video";
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
                  axios
                    .get(
                      `https://instantlinks.co/api?api=24571ab77a4901c5e7d16fb6f2b02dbd6c5c3db2&url=${vidUrl[0].embedUrl}&type=2`
                    )
                    .then((res) => {
                      console.log(res.data.shortenedUrl);
                      axios
                        .get(
                          `https://api.telegram.org/bot6465806242:AAH5As3iEipDMow9d8IM8bmGXya3udjEgYM/sendMessage?chat_id=@daily_newspaper_hindi24&text=Title- "${vidUrl[0].name}
                        || *Video-* + [Click Here](${vidUrl[0].embedUrl})
                        || _If You Want to help us Watch with this Link - ${res.data.shortenedUrl}_&parse_mode=markdown`
                        )
                        .then((res) => {
                          console.log(res.data.ok);
                        });
                    });

                  // write code to send email with text "new video available" with the video link = vidUrl[0].embedUrl
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
                    subject: "dainik Bhaskar",
                    html: `<b>New Video - </b>${vidUrl[0].embedUrl}<br/><br/><b>Title:- </b>${vidUrl[0].name}<br/><br/><img style="width: 100%;height: 250px;object-fit: cover;" src="${vidUrl[0].thumbnailUrl[0]}">`,
                  };

                  transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("email sent" + info.response);
                    }
                  });

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

setInterval(checkBhaskarAndSendMail, 500000);
// checkBhaskarAndSendMail();
