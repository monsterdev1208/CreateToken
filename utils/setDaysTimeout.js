function setDaysTimeout(callback, time, ...args) {
    // 86400 seconds in a day
    let msInDay = 86400*1000;
    let days = Math.floor(time / msInDay);
    let rest = time % msInDay;
    let dayCount = 0;
    setTimeout(() => {
        let timer = setInterval(function () {
            dayCount++;  // a day has passed

            if (dayCount === days) {
                clearInterval(timer);
                callback(...args);
            }
        }, msInDay);
    }, rest);

}

module.exports = setDaysTimeout;