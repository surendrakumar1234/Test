require("dotenv").config();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

const express = require("express");
const app = express();

const PORT = process.env.port || 3000;


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  fs.readFile("./homepage.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      res.send("hello");
    } else {
      let jobs;
      fs.readFile("./jobbulatin.json", "utf-8", (err, jobdata) => {
        if (err) {
          console.log(err);
          return res.send("hello2");
        } else {
          jobs = JSON.parse(jobdata);
          console.log("jobbulatin", jobs);

          const fsdata = JSON.parse(data);
          fsdata.forEach((data) => {
            const blogId = data.timeStamps;
            data.id = blogId;
            const date = new Date(data.timeStamps);
            const currDate = new Date();
            const yearGap = currDate.getFullYear() - date.getFullYear();
            const monthGap = currDate.getMonth() - date.getMonth();
            const dayGap = currDate.getDate() - date.getDate();
            const hourGap = currDate.getHours() - date.getHours();
            const minGap = currDate.getMinutes() - date.getMinutes();
            const secGap = currDate.getSeconds() - date.getSeconds();

            if (yearGap !== 0) {
              data.timeStamps = yearGap + " year ago";
            } else if (monthGap !== 0) {
              data.timeStamps = monthGap + " month ago";
            } else if (dayGap !== 0) {
              data.timeStamps = dayGap + " day ago";
            } else if (hourGap !== 0) {
              data.timeStamps = hourGap + " hour ago";
            } else if (minGap !== 0) {
              data.timeStamps = minGap + " minutes ago";
            } else if (secGap !== 0) {
              data.timeStamps = secGap + " seconds ago";
            } else {
              data.timeStamps = date.toLocaleTimeString().toLowerCase();
            }
          });
          // console.log(fsdata);
          return res.render("homepage", {
            fsdata,
            jobs,
          });
        }
      });
    }
  });
});

app.get("/blog/:id", (req, res) => {
  fs.readFile("./blogs.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      res.send("hello");
    } else {
      let fsdata = JSON.parse(data);
      fsdata = fsdata.find((blog) => blog.timeStamps == req.params.id);
      if (fsdata) {
        const date = new Date(fsdata.timeStamps);
        const currDate = new Date();
        const yearGap = currDate.getFullYear() - date.getFullYear();
        const monthGap = currDate.getMonth() - date.getMonth();
        const dayGap = currDate.getDate() - date.getDate();
        const hourGap = currDate.getHours() - date.getHours();
        const minGap = currDate.getMinutes() - date.getMinutes();
        const secGap = currDate.getSeconds() - date.getSeconds();

        if (yearGap !== 0) {
          fsdata.timeStamps = yearGap + " year ago";
        } else if (monthGap !== 0) {
          fsdata.timeStamps = monthGap + " month ago";
        } else if (dayGap !== 0) {
          fsdata.timeStamps = dayGap + " day ago";
        } else if (hourGap !== 0) {
          fsdata.timeStamps = hourGap + " hour ago";
        } else if (minGap !== 0) {
          fsdata.timeStamps = minGap + " minutes ago";
        } else if (secGap !== 0) {
          fsdata.timeStamps = secGap + " seconds ago";
        } else {
          fsdata.timeStamps = date.toLocaleTimeString().toLowerCase();
        }

        // console.log(fsdata);
        res.render("blogpage", {
          fsdata,
        });
      } else {
        res.send("this post must be deleted");
      }
    }
  });
});

app.get("/letest", (req, res) => {
  fs.readFile("./blogs.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      res.send("hello");
    } else {
      let fsdata = JSON.parse(data);
      fsdata = fsdata[0];
      if (fsdata) {
        const date = new Date(fsdata.timeStamps);
        const currDate = new Date();
        const yearGap = currDate.getFullYear() - date.getFullYear();
        const monthGap = currDate.getMonth() - date.getMonth();
        const dayGap = currDate.getDate() - date.getDate();
        const hourGap = currDate.getHours() - date.getHours();
        const minGap = currDate.getMinutes() - date.getMinutes();
        const secGap = currDate.getSeconds() - date.getSeconds();

        if (yearGap !== 0) {
          fsdata.timeStamps = yearGap + " year ago";
        } else if (monthGap !== 0) {
          fsdata.timeStamps = monthGap + " month ago";
        } else if (dayGap !== 0) {
          fsdata.timeStamps = dayGap + " day ago";
        } else if (hourGap !== 0) {
          fsdata.timeStamps = hourGap + " hour ago";
        } else if (minGap !== 0) {
          fsdata.timeStamps = minGap + " minutes ago";
        } else if (secGap !== 0) {
          fsdata.timeStamps = secGap + " seconds ago";
        } else {
          fsdata.timeStamps = date.toLocaleTimeString().toLowerCase();
        }

        // console.log(fsdata);
        res.render("blogpage", {
          fsdata,
        });
      } else {
        res.send("this post must be deleted");
      }
    }
  });
});

app.get("/search", (req, res) => {
  if (req.query.query) {
    fs.readFile("./homepage.json", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
        res.send("Error Ho gaya Bhai");
      } else {
        let fsdata = JSON.parse(data);
        fsdata = fsdata.find((blog) =>
          blog.title.toLowerCase().includes(req.query.query.toLowerCase())
        );
        if (fsdata) {
          // console.log("fsdata", fsdata);
          res.send(
            `<h1>1 Result Founded</h1> <a href=/blog/${fsdata.timeStamps}>CLICK HERE</a>`
          );
        } else {
          res.send("No result found");
        }
      }
    });
  } else {
    res.render("searchpage");
  }
});

app.all("*", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => console.log("server started"));

function checkNewPost() {
  try {
    axios
      .get("https://dainikvacancy.in")
      .then((res) => {
        try {
          const html = res.data;
          let links = [];
          const $ = cheerio.load(html);
          $("body").each((index, element) => {
            let name = $(element)
              .find("article")
              .find("div>header>h2>a")
              .attr("href");

            const url = name;

            name = $(element)
              .find("article")
              .find("div>header")
              .find("h2:nth-child(1)>a")
              .toString();

            name = name.split("<a");

            name = "<a" + name[1];

            const title = $(name).text();

            let timeStamps = $(element)
              .find("article")
              .find("div>header>div>span")
              .find("time:nth-child(1)")
              .attr("datetime");

            let thumbnailUrl = $(element)
              .find("article")
              .find("div>div>a>img")
              .attr("data-lazy-src");

            name = { title, timeStamps, thumbnailUrl };

            console.log(name);

            // console.log("object", title);

            let vidUrl = [];
            vidUrl.push({
              ...name,
              id: vidUrl.length + 1,
            });

            // console.log(vidUrl);

            fs.readFile("./homepage.json", "utf-8", (err, data) => {
              if (err) {
                console.log(err);
              } else {
                let fsReadedVid = JSON.parse(data);
                // console.log("fsReadedVid", fsReadedVid[0]);

                if (fsReadedVid[0].timeStamps == vidUrl[0].timeStamps) {
                  console.log("new Post Not available");
                } else {
                  const result = getNewPostData(
                    url,
                    title,
                    thumbnailUrl,
                    timeStamps
                  );
                  console.log("result", result);

                  fsReadedVid.forEach((element) => {
                    vidUrl.push({ ...element, id: vidUrl.length + 1 });
                  });
                  console.log(vidUrl);

                  fs.writeFile(
                    "./homepage.json",
                    JSON.stringify(vidUrl),
                    (err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log("written");
                      }
                    }
                  );
                }
              }
            });
          });
        } catch (error) {
          console.log(error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
}
checkNewPost();
setInterval(checkNewPost, 500000);

function getNewPostData(url, title, thumbnailUrl, timeStamps) {
  try {
    axios.get(url).then((res) => {
      try {
        const html = res.data;
        let links = [];
        const $ = cheerio.load(html);
        $("body").each((index, element) => {
          let name = $(element).find("article").find("div>div>p").toString();

          if (name.includes("dainikvacancy")) {
            console.log("included");
            name = name.replaceAll("https://dainikvacancy.in/", "");
          }

          // console.log(name);
          name = { name };

          let vidUrl = [];
          vidUrl.push({
            ...name,
            id: vidUrl.length + 1,
            title: title,
            thumbnailUrl,
            timeStamps,
          });

          // console.log(vidUrl);
          try {
            fs.readFile("./blogs.json", "utf-8", (err, data) => {
              if (err) {
                console.log(err);
                return false;
              } else {
                let fsReadedVid = JSON.parse(data);
                // console.log("fsReadedVid", fsReadedVid[0]);

                fsReadedVid.forEach((element) => {
                  vidUrl.push({ ...element, id: vidUrl.length + 1 });
                });
                console.log(vidUrl);

                fs.writeFile("./blogs.json", JSON.stringify(vidUrl), (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("written");
                  }
                });
                return true;
              }
            });
          } catch (error) {
            return false;
          }
        });
      } catch (error) {
        console.log(error);
        return false;
      }
    });
  } catch (error) {
    console.log(error);
    return false;
  }
}

function bhaskarKhaasJob() {
  try {
    axios
      .get("https://www.bhaskar.com/bhaskar-khaas/job-&-education-bulletin/")
      .then((res) => {
        const html = res.data;
        let links = [];
        const $ = cheerio.load(html);

        $("#root").each((index, element) => {
          let name = $(element)
            .find("div:nth-child(3)")
            .find("div:nth-child(2)")
            .find("div:nth-child(2)")
            .find("div:nth-child(1)")
            .find("div:nth-child(2)")
            .find("div:nth-child(2)>ul")
            .find("div:nth-child(1)")
            .find("div:nth-child(1)>li")
            .find("a:nth-child(1)>div>div>figure>picture>source")
            .attr("srcset");

          // console.log(name);
          const gifThumbnail = name;

          console.log(gifThumbnail);

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

          // console.log("object", name);

          name = name.split("/");
          console.log(name[2]);
          if (name[3] === "news") {
            name =
              name[1] + "/" + name[2] + "/video/" + name[4] + "?type=video";
          }
          if (name[2] === "news") {
            name = name[1] + "/video/" + name[3] + "?type=video";
          } else if (name[4] === "news") {
            name =
              name[1] +
              "/" +
              name[2] +
              "/" +
              name[3] +
              "/video/" +
              name[5] +
              "?type=video";
          }
          console.log("https://www.bhaskar.com/" + name);

          axios
            .get("https://www.bhaskar.com/" + name)
            .then((res) => {
              const $ = cheerio.load(res.data);

              let vidUrl = [];
              name = JSON.parse($("script").get()[6].children[0].data);
              vidUrl.push({ ...name, gifThumbnail, id: vidUrl.length + 1 });

              console.log(vidUrl[0].embedUrl);

              fs.readFile(`./jobbulatin.json`, "utf-8", (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  let fsReadedVid = JSON.parse(data);
                  // console.log("fsReadedVid", fsReadedVid[0].embedUrl);

                  fsReadedVid.forEach((element) => {
                    vidUrl.push({
                      ...element,
                      id: vidUrl.length + 1,
                    });
                  });

                  if (
                    fsReadedVid[0].embedUrl === vidUrl[0].embedUrl ||
                    !fsReadedVid[0].embedUrl
                  ) {
                    console.log("new video not available");
                  } else {
                    console.log("new video available");

                    fs.writeFile(
                      `./jobbulatin.json`,
                      JSON.stringify(vidUrl),
                      (err) => {
                        if (err) {
                          console.error(err);
                        } else {
                          console.log("Written Successfully");
                        }
                      }
                    );
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
        console.log("err");
      });
  } catch (error) {
    console.log(error);
  }
}
bhaskarKhaasJob();
setInterval(bhaskarKhaasJob,900000);

// function bhaskarKhaasJob2(joburl) {
//   try {
//     axios
//       .get("https://www.bhaskar.com/bhaskar-khaas/job-&-education-bulletin/")
//       .then((res) => {
//         const html = res.data;
//         let links = [];
//         const $ = cheerio.load(html);

//         $("#root").each((index, element) => {
//           let name = $(element)
//             .find("div:nth-child(3)")
//             .find("div:nth-child(2)")
//             .find("div:nth-child(2)")
//             .find("div:nth-child(1)")
//             .find("div:nth-child(2)")
//             .find("div:nth-child(2)>ul")
//             .find("div:nth-child(1)")
//             .find("div:nth-child(1)>li")
//             .find("a:nth-child(1)>div>div>figure>picture>source")
//             .attr("srcset");

//           // console.log(name);
//           const gifThumbnail = name;

//           console.log(gifThumbnail);

//           name = $(element)
//             .find("div:nth-child(3)")
//             .find("div:nth-child(2)")
//             .find("div:nth-child(1)")
//             .find("div:nth-child(2)>ul")
//             .find("div:nth-child(1)")
//             .find("div:nth-child(1)>li")
//             .find("a:nth-child(1)")
//             .attr("href")
//             .trim();

//           name = joburl;

//           // console.log("object", name);

//           name = name.split("/");
//           console.log(name[2]);
//           if (name[3] === "news") {
//             name =
//               name[1] + "/" + name[2] + "/video/" + name[4] + "?type=video";
//           }
//           if (name[2] === "news") {
//             name = name[1] + "/video/" + name[3] + "?type=video";
//           } else if (name[4] === "news") {
//             name =
//               name[1] +
//               "/" +
//               name[2] +
//               "/" +
//               name[3] +
//               "/video/" +
//               name[5] +
//               "?type=video";
//           }
//           console.log("https://www.bhaskar.com/" + name);

//           axios
//             .get("https://www.bhaskar.com/" + name)
//             .then((res) => {
//               const $ = cheerio.load(res.data);

//               let vidUrl = [];
//               name = JSON.parse($("script").get()[6].children[0].data);
//               vidUrl.push({ ...name, gifThumbnail, id: vidUrl.length + 1 });

//               console.log(vidUrl[0].embedUrl);

//               fs.readFile(`./jobbulatin.json`, "utf-8", (err, data) => {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   let fsReadedVid = JSON.parse(data);
//                   // console.log("fsReadedVid", fsReadedVid[0].embedUrl);

//                   fsReadedVid.forEach((element) => {
//                     vidUrl.push({
//                       ...element,
//                       id: vidUrl.length + 1,
//                     });
//                   });

//                   if (
//                     fsReadedVid[0].embedUrl === vidUrl[0].embedUrl ||
//                     !fsReadedVid[0].embedUrl
//                   ) {
//                     console.log("new video not available");
//                   } else {
//                     console.log("new video available");

//                     fs.writeFile(
//                       `./jobbulatin.json`,
//                       JSON.stringify(vidUrl),
//                       (err) => {
//                         if (err) {
//                           console.error(err);
//                         } else {
//                           console.log("Written Successfully");
//                         }
//                       }
//                     );
//                   }
//                 }
//               });
//             })
//             .catch(() => {
//               console.log("video axios err");
//             });
//         });
//       })
//       .catch(() => {
//         console.log("err");
//       });
//   } catch (error) {
//     console.log(error);
//   }
// }

// const links = [
//   "https://www.bhaskar.com/career/news/21413-recruitments-for-10th-pass-vacancy-for-300-gd-posts-in-indian-coast-guard-10th-board-paper-leaked-in-haryana-134564161.html",
//   "https://www.bhaskar.com/career/news/recruitment-for-the-post-of-librarian-in-mppsc-notification-released-for-400-posts-in-bank-of-india-10th-board-re-exam-date-released-in-jharkhand-134576027.html",
//   "https://www.bhaskar.com/career/news/tomorrow-is-the-last-date-to-apply-for-2691-posts-in-union-bank-of-india-10th-paper-circulated-on-whatsapp-in-etah-up-134582372.html",
//   "https://www.bhaskar.com/career/news/applications-for-3623-posts-in-bihar-technical-service-commission-start-today-vacancies-in-cisf-mp-tet-result-released-134588644.html",
//   "https://www.bhaskar.com/career/news/recruitment-for-966-posts-in-madhya-pradesh-staff-selection-board-executive-vacancy-in-ntpc-mppsc-state-service-prelims-2025-mains-2024-result-released-134594867.html",
//   "https://www.bhaskar.com/career/news/nbcfdm-recruits-7510-posts-union-bank-of-india-announces-2691-vacancies-mahila-samridhi-yojana-launched-in-delhi-134601331.html",
//   "https://www.bhaskar.com/career/news/53749-vacancies-in-rajasthan-staff-selection-board-for-10th-pass-1930-vacancies-in-mppsc-cuet-pg-city-slip-released-134607482.html",
//   "https://www.bhaskar.com/career/news/recruitment-for-642-posts-in-dedicated-freight-corridor-corporation-notification-issued-for-350-specialist-posts-in-pnb-134619966.html",
//   "https://www.bhaskar.com/career/news/recruitment-for-10729-posts-including-medical-officer-in-bihar-notification-for-6134-posts-for-12th-pass-started-modi-on-mauritius-visit-134626112.html",
// ];
// links.forEach((link, i) => {
//   setTimeout(bhaskarKhaasJob2, i + "000", link);
// });

// const time = "2025-03-10T20:43:48+05:30";
// console.log(new Date(time).toDateString());

// const colors = ["#83b82e","#ff554b","#f89c1d","#39c3a2","#9d46f3","#0f86f5","#7059ff","#3e9e3e"]

// let title =
//   "Bhartiya Suraksha dasta Parishad Vacancy: भारतीय सुरक्षा दस्ता परिषद का 10वीं पास भर्ती का नोटिफिकेशन जारी";
// title = title.split(":");
// console.log(title[0]);
