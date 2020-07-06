//app.js
import {Token} from 'utils/token.js';
// import {Log} from 'utils/log.js'

App({

  onLaunch: function () {
    const token = new Token();
    // const log = new Log();
    token.verify();
    // log.writeLog({ behavior: 1})
  },
  
})