const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const fs = require("fs");

const sendNewspaperToTelegramGroup = (newspaperdate, gLink, shortenedUrl) => {
  try {
    axios
      .get(
        `https://api.telegram.org/bot6465806242:AAH5As3iEipDMow9d8IM8bmGXya3udjEgYM/sendPhoto?chat_id=-1002499362787&message_thread_id=85&caption=*${newspaperdate}*:- ${gLink} %0A %0A*If You Want to help us View with this Link - ${shortenedUrl}*&parse_mode=markdown&photo=https://images.bhaskarassets.com/thumb/500x0/web2images/web-frontend/epaper/topBannerImg-521.png`
      )
      .then((res) => {
        console.log(res.data.ok);
      })
      .catch(() => {
        console.log("telegram err");
      });
  } catch (error) {}
};

function dainikBhaskarNewspaper() {
  try {
    axios
      .get("https://www.dailyepaper.in/dainik-bhaskar-epaper/")
      .then((res) => {
        const html = res.data;
        let epaperlinks = [];
        const $ = cheerio.load(html);
        let gLink = $("div.entry-content>p>span>a")
          .parent()
          .parent()
          .toString();
        let newspaperdate = $(gLink).find("span:nth-child(1)").text();
        newspaperdate = newspaperdate.split(":");
        newspaperdate = newspaperdate[0];
        gLink = $(gLink).find("span:nth-child(1)>a").attr("href");

        fs.readFile("./newspaper.json", (err, data) => {
          if (err) {
            console.log(err);
          } else {
            const newspapersreadedData = JSON.parse(data);
            if (newspapersreadedData[0].link == gLink) {
              console.log("new newspaper not found");
            } else {
              epaperlinks.push({
                date: newspaperdate,
                link: gLink,
                timeStapms: Date.now(),
              });

              newspapersreadedData.forEach((data) => {
                epaperlinks.push(data);
              });
              console.log(newspaperdate);

              //send to telegram code
              axios
                .get(
                  `https://instantlinks.co/api?api=24571ab77a4901c5e7d16fb6f2b02dbd6c5c3db2&url=${gLink}&type=2`
                )
                .then((res) => {
                  // console.log(res.data.shortenedUrl);
                  const shortenedUrl = res.data.shortenedUrl;
                  axios
                    .get(
                      `https://api.telegram.org/bot6465806242:AAH5As3iEipDMow9d8IM8bmGXya3udjEgYM/sendPhoto?chat_id=@daily_newspaper_hindi24&caption=*${newspaperdate}*:- ${gLink} %0A %0A*If You Want to help us View with this Link - ${shortenedUrl}*&parse_mode=markdown&photo=https://images.bhaskarassets.com/thumb/500x0/web2images/web-frontend/epaper/topBannerImg-521.png`
                    )
                    .then((res) => {
                      console.log(res.data.ok);
                      sendNewspaperToTelegramGroup(
                        newspaperdate,
                        gLink,
                        shortenedUrl
                      );
                    });
                });
              //send to telegram code

              fs.writeFile(
                "./newspaper.json",
                JSON.stringify(epaperlinks),
                (err) => {
                  console.log(err);
                }
              );
            }
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
}
dainikBhaskarNewspaper();
setInterval(dainikBhaskarNewspaper, 1000000);
