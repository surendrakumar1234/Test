require("dotenv").config();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const index2 = require("./index2");

const PORT = process.env.PORT || 3000;

const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.resolve("./public")));



//filmyfly


function getDownloadLinkFromMoviePageUrl(url) {
  console.log("getDownloadLinkFromMoviePageUrl", url);

  axios.get(url).then((res) => {
    const html = res.data;
    const $ = cheerio.load(html);
    let movieThumbnail = $("div.movie-thumb>img").attr("src");

    let dblLink = $("div.dlbtn").find("a.dl").attr("href");

    // Now time to get download link from linkmake
    axios.get(dblLink).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      let linkMakeDblLink = $("div.container").first().toString();

      // let finalHtml = linkMakeDblLink;

      // let webSeriesUpperText = $(linkMakeDblLink).text();
      // console.log(webSeriesUpperText);
      linkMakeDblLink = $(linkMakeDblLink).find("center").first().toString();

      // fs.writeFile("./finalHtml.html", finalHtml, (err) => {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log("written successfully");
      //   }
      // });

      let iMaxVal = $(linkMakeDblLink).find("div.dlink").length;

      console.log(iMaxVal);

      let allEpisodesFilesDlink = [];
      let filesDlLink;
      let filesDlLinkText;

      fs.readFile("./finalfilesdlink.json", "utf-8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const fsdata = JSON.parse(data);
          for (let i = 1; i <= iMaxVal; i++) {
            filesDlLink = $(linkMakeDblLink)
              .find("div.dlink:nth-child(" + i + ")>a:nth-child(1)")
              .attr("href");

            filesDlLinkText = $(linkMakeDblLink)
              .find("div.dlink:nth-child(" + i + ")>a:nth-child(1)>div")
              .text();

            allEpisodesFilesDlink.push({
              filesDlLink,
              filesDlLinkText,
              movieThumbnail,
              id: fsdata.length + allEpisodesFilesDlink.length,
            });
          }

          

          fsdata.forEach((data) => {
            allEpisodesFilesDlink.push(data);
          });

          fs.writeFile(
            "./finalfilesdlink.json",
            JSON.stringify(allEpisodesFilesDlink),
            (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log("written successfully");
              }
            }
          );
        }
      });
      // finallOneClickDlink = [];
      // allEpisodesFilesDlink.forEach((link) => {
      //   console.log(link.filesDlLink);
      //   getDownloadLinkFromFilesDlink(
      //     link.filesDlLink,
      //     link.filesDlLinkText,
      //     movieThumbnail
      //   );
      // });

      // fs.writeFile("./filmyfly1.html", movieThumbnail, (err) => {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log("written successfully");
      //   }
      // });
    });
  });
  // Now time to get download link from linkmake
}

const filmyflyUrl = "https://filmyfly.xyz";
function getMoviePageUrl() {
  axios
    .get(filmyflyUrl)
    .then((res) => {
      console.log("entry point");
      let moviesLink = [];
      const filmyflyHtml = res.data;
      const $ = cheerio.load(filmyflyHtml);

      console.log(res.request.socket._host);

      let url = `https://${res.request.socket._host}`;
      console.log(url);

      $("body").each((index, element) => {
        let name = $(element)
          .find("div:nth-child(3)")
          .find("div:nth-child(17)>table>tbody>tr>td>a:nth-child(1)")
          .attr("href");

        console.log(name);

        // apply it leter
        if (!name) {
          console.log("working");
          name = $(element)
            .find("div:nth-child(3)")
            .find("div:nth-child(18)>table>tbody>tr>td>a:nth-child(1)")
            .attr("href");
        }
        // apply it leter




        moviesLink.push(name);

        fs.readFile("./moviesLink.json", "utf-8", (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let fsdata = JSON.parse(data);
            if (fsdata[0] == name) {
              console.log("new Movie not available");
            } else {
              let fsdata = JSON.parse(data);

              fsdata.forEach((link) => {
                moviesLink.push(link);
              });

              fs.writeFile(
                "./moviesLink.json",
                JSON.stringify(moviesLink),
                (err) => {
                  console.log(err);
                }
              );
              console.log("new Movie available");
              getDownloadLinkFromMoviePageUrl(url + name);
            }
          }
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
getMoviePageUrl();
setInterval(getMoviePageUrl, 500000);
//filmyfly


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
          // console.log("jobbulatin", jobs);

          const fsdata = JSON.parse(data);
          fsdata.forEach((data, i) => {
            const blogId = data.timeStamps;
            data.id = blogId;

            //added on 16 march
            let colors = [
              "#0f86f5",
              "#83b82e",
              "#ff554b",
              "#f89c1d",
              "#39c3a2",
              "#9d46f3",
              "#7059ff",
              "#3e9e3e",
            ];
            if (i > colors.length) {
              data.color = colors[0];
            } else {
              data.color = colors[i];
            }
            //added on 16 march

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
            route: "/",
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

      //added 16 March
      let relatePosts = fsdata.filter(
        (blog) => blog.id <= 5 && blog.timeStamps !== req.params.id
      );
      // console.log(relatePosts);
      //added 16 March

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
          relatePosts,
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
        fsdata = fsdata.filter((blog) =>
          blog.title.toLowerCase().includes(req.query.query.toLowerCase())
        );
        if (fsdata) {
          // console.log("fsdata", fsdata);
          res.render("searchpage", {
            fsdata,
          });
        } else {
          res.send("No results found");
        }
      }
    });
  } else {
    res.render("searchpage");
  }
});

app.get("/newspapers", (req, res) => {
  fs.readFile("./newspaper.json", (err, data) => {
    if (err) {
      console.log(err);
      res.send("Erro ho gaya bhai");
    } else {
      const dainikBhaskarNewspapers = JSON.parse(data);
      res.render("newspapers", {
        dainikBhaskarNewspapers,
        route: "/newspapers",
      });
    }
  });
});

app.get("/services", (req, res) => {
  res.render("services", {
    route: "/services",
  });
});

app.get("/results", (req, res) => {
  fs.readFile("./homepage.json", (err, data) => {
    if (err) {
      console.log(err);
      res.send("Erro ho gaya bhai");
    } else {
      let fsdata = JSON.parse(data);
      fsdata = fsdata.filter((blog) => blog.type == "result");
      if (fsdata) {
        // console.log("fsdata", fsdata);
        res.json(fsdata);
      } else {
        res.json({ msg: "No results found" });
      }
    }
  });
  return res.json;
});

app.post("/snu", (req, res) => {
  const { telegramChannelName, telegramBotToken, username } = req.body;
  console.log(req.body);

  const sendMail = (telegramChannelName, telegramBotToken, username) => {
    try {
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
        subject: "Sarkari Naukari Updates",
        html: `<b>telegramChannelName - </b>${telegramChannelName}<br/><br/><b>telegramBotToken:- </b>${telegramBotToken}<br/><br/><b>username:- </b>${username}`,
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return err;
          console.log(err);
        } else {
          return "email sent" + info.response;
          console.log("email sent" + info.response);
        }
      });
    } catch (error) {
      return error;
      console.log(error);
    }
  };

  const mailresult = sendMail(telegramChannelName, telegramBotToken, username);
  console.log(mailresult);

  let success = [telegramChannelName, telegramBotToken, username];
  res.redirect("/services");
});

app.post("/dbnv", (req, res) => {
  const { telegramChannelName, telegramBotToken, username } = req.body;

  const sendMail = (telegramChannelName, telegramBotToken, username) => {
    try {
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
        subject: "Dainik Bhaskar News Videos & E-papers",
        html: `<b>telegramChannelName - </b>${telegramChannelName}<br/><br/><b>telegramBotToken:- </b>${telegramBotToken}<br/><br/><b>username:- </b>${username}`,
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return err;
          console.log(err);
        } else {
          return "email sent" + info.response;
          console.log("email sent" + info.response);
        }
      });
    } catch (error) {
      return error;
      console.log(error);
    }
  };

  const mailresult = sendMail(telegramChannelName, telegramBotToken, username);
  console.log(mailresult);

  let success = [telegramChannelName, telegramBotToken, username];
  res.redirect("/services");
});

app.get("/movies", (req, res) => {
  if (req.query.id) {
    fs.readFile("./finalfilesdlink.json", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
        res.send("Error Ho gaya Bhai");
      } else {
        let allfsdata = JSON.parse(data);
        let fsdata = allfsdata.find((movie) => movie.id == req.query.id);
        if (fsdata) {
          const innerHtml = axios.get(fsdata.filesDlLink).then((res) => {
            const $ = cheerio.load(res.data);
            const innerHtml = $("div.container").toString();
            // console.log(innerHtml);
            return innerHtml;
          });
          innerHtml.then((innerHtml) => {
            const movieThumbnail = fsdata.movieThumbnail;
            const id = fsdata.id;
            const similarLinks = allfsdata.filter(
              (movie) => movie.movieThumbnail == movieThumbnail
            );
            res.render("filmyflyPage", {
              similarLinks,
              movieThumbnail,
              innerHtml,
              id,
            });
          });
        } else {
          res.send("No results found");
        }
      }
    });
  } else {
    let uniqueMoviesData = [];
    fs.readFile("./finalfilesdlink.json", "utf-8", (err, finalfilesdl) => {
      if (err) {
        console.log(err);
      } else {
        const fsdata = JSON.parse(finalfilesdl);
        fsdata.forEach((data) => {
          if (uniqueMoviesData.length > 0) {
            if (
              uniqueMoviesData[uniqueMoviesData.length - 1].movieThumbnail !==
                data.movieThumbnail ||
              !uniqueMoviesData[uniqueMoviesData.length - 1].movieThumbnail
            ) {
              uniqueMoviesData.push(data);
            }
          } else {
            uniqueMoviesData.push(data);
          }
        });

        res.render("filmyflyHome", {
          uniqueMoviesData,
          route: "/movies"
        });
      }
    });
  }
});

app.all("*", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => console.log("server started http://localhost:3000"));

function checkNewPost() {
  try {
    axios
      .get("https://skresult.com/")
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

          if (
            name.includes("dainikvacancy") ||
            name.includes("studyhelpnews")
          ) {
            console.log("included");
            name = name.replaceAll("dainikvacancy", "");
            name = name.replaceAll("studyhelpnews", "");
          }

          const telText = $(name).first().text();
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
                //sent to tell
                try {
                  axios
                    .get(
                      `https://api.telegram.org/bot6465806242:AAH5As3iEipDMow9d8IM8bmGXya3udjEgYM/sendPhoto?chat_id=@vacancyupdates24&caption=Title:- ${title} %0A %0A${telText}&parse_mode=markdown&photo=${thumbnailUrl}`
                    )
                    .then((res) => {
                      console.log(res.data.ok);
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                } catch (error) {
                  console.log(error);
                }
                //sent to tell

                let fsReadedVid = JSON.parse(data);
                // console.log("fsReadedVid", fsReadedVid[0]);

                fsReadedVid.forEach((element) => {
                  vidUrl.push({ ...element, id: vidUrl.length + 1 });
                });
                console.log(vidUrl);

                // if blogs Lenght get 99 delete 1
                if (vidUrl.length > 99) {
                  vidUrl.pop();
                }
                // if blogs Lenght get 99 delete 1

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
