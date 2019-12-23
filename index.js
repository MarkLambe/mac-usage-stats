const util = require("util");
const exec = util.promisify(require("child_process").exec);
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const msToDays = ms => Math.floor((ms / 1000 / 60 / 60 / 24) * 100) / 100;

module.exports = async function main() {
  if (process.platform !== "darwin") {
    console.log(`This only works on Mac, sorry`);
    return;
  }

  let totalUptimeHours = await exec(
    "smartctl -a disk0 -s on| grep Power_On_Hours | awk '{print $10}'"
  );
  if (
    totalUptimeHours["stderr"] &&
    totalUptimeHours["stderr"].indexOf("smartctl: command not found") !== -1
  ) {
    console.log(
      `This has one dependency, smartctl must be installed on your Mac. It gets hard drive info and is a handy tool to have =)`
    );
    return;
  }
  totalUptimeHours = Number(totalUptimeHours["stdout"]);

  let initializeYear = await exec(
    "ls -la /private/var/db/.AppleSetupDone | awk '{print $8}'"
  );

  initializeYear =
    initializeYear["stdout"].indexOf(":") === -1
      ? Number(initializeYear["stdout"])
      : new Date().getFullYear();

  let initializeMonth = await exec(
    "ls -la /private/var/db/.AppleSetupDone | awk '{print $7}'"
  );
  initializeMonth = initializeMonth["stdout"].replace("\n", "");

  const initializeMonthNumber = months.indexOf(initializeMonth);

  let initializeDay = await exec(
    "ls -la /private/var/db/.AppleSetupDone | awk '{print $6}'"
  );
  initializeDay = Number(initializeDay["stdout"]);

  boughtDate = new Date(initializeYear, initializeMonthNumber, initializeDay);
  timeSinceBought = new Date() - boughtDate;

  hoursPerDay = totalUptimeHours / msToDays(timeSinceBought);

  const answer = `Since you turned on this machine (${initializeDay}/${initializeMonth}/${initializeYear}, ${msToDays(
    timeSinceBought
  )} days ago) it's been on for ${totalUptimeHours} hours, an average of ${Math.floor(
    hoursPerDay
  )} hours and ${Math.floor(
    (hoursPerDay - Math.floor(hoursPerDay)) * 60
  )} minutes per day.`;
  console.log(answer);
};
