//node Hackerrank_moderator.js --url=https://hackerrank.com --config=config.json
//npm init -y
//npm install minimist
//npm install puppeteer
let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");
const { cachedDataVersionTag } = require("v8");

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

async function start() {
    // start the browser
    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });

    // get the tabs (there is only one tab)
    let pages = await browser.pages();
    let page = pages[0];

    // open the url
    await page.goto(args.url);

    // wait and then click on login on page1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");
    
    //wait and then click on login on page2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    // wait and then type userid
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']",configJSO.userid,{delay:30});

    //wait and then type password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']",configJSO.password,{delay:30});

    await page.waitFor(3000);

    //wait and click on login
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    //wait and click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    //wait and click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

   

    await page.waitForSelector("a.backbone.block-center");
    let curls=await page.$$eval("a.backbone.block-center",function(atags){
        let urls=[];
        for(let i=0;i<atags.length;i++){
            let url=atags[i].getAttribute("href");
            urls.push(url);
        }
        return urls;
    });

    await page.waitFor(3000);
    for(let i=0;i<curls.length;i++) {
        let ctab=await browser.newPage();
        await saveModerator(ctab,args.url + curls[i],configJSO.moderator);
        await ctab.close();
        await page.waitFor(3000);
    }

    await browser.close();
    console.log("Successfully Completed");
  
}

async function saveModerator(ctab, fullcurl, moderator) {
    await ctab.bringToFront();
    await ctab.goto(fullcurl);

    await ctab.waitFor(3000);
     //wait and click on moderators
     await ctab.waitForSelector("li[data-tab='moderators']");
     await ctab.click("li[data-tab='moderators']");
     
     //wait and type moderator name
     await ctab.waitForSelector("input#moderator");
     await ctab.type("input#moderator",configJSO.moderator,{delay:50});
 
     //add the moderator
     await ctab.waitForSelector("button.btn.moderator-save");
     await ctab.click("button.btn.moderator-save");

}
start();










