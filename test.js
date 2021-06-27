function add(a, b) {
  return a + b;
}

function square(a) {
  return a * a;
}

function minus(a) {
  return --a;
}

// //compose 1.0 手动合并函数

// function compose(fn1, fn2, fn3) {
//   return (...args) => {
//     return fn1(fn2(fn3(...args)));
//   };
// }

// console.log(compose(minus, square, add)(1, 2));

//compose 2.0 支持数组

// function compose(mids) {
//   let length = mids.length;
//   return (...args) => {
//     let ret;
//     for (let i = 0; i < length; i++) {
//       if (i === 0) ret = mids[i](...args);
//       else {
//         ret = mids[i](ret);
//       }
//     }
//     return ret;
//   };
// }

// console.log(compose([add, square, minus])(1, 2));

//compose 3.0 支持 async wait

function composeAsnc(mids) {
  return () => {
    //默认调用第一个函数
    //支持用户手动向下调用
    let dispatch = (i) => {
      let fn = mids[i];
      if (!fn) {
        return Promise.resolve();
      }
      let next = () => {
        dispatch(i + 1);
      };
      return Promise.resolve(fn(next));
    };
    return dispatch(0);
  };
}

let sleep = (num = 2000) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, num);
  });

let fn1 = async (next) => {
  console.log("fn1");
  await sleep();
  await next();
  console.log("fn1-end");
};

let fn2 = async (next) => {
  console.log("fn2");
  await next();
  console.log("fn2-end");
};

let fn3 = async (next) => {
  console.log("fn3");
};

composeAsnc([fn1, fn2, fn3])();
