// const INIT_DATA = [
//   {
//     year: 2020,
//     month: 1,
//     date: [
//       {
//         date: 1, // 1-31
//         day: [0 - 6], // CN-T7
//         isEvent: false // false true
//       }
//       //...date2, ...
//     ]
//   }
//   //... {year month date}, ...
// ];

export const getInitData = (obj) => {
  let { year, startMonth, numberOfMonth } = obj;
  let data = [];

  for (let i = 0; i < numberOfMonth; ++i, ++startMonth) {
    let objDate = {};
    //
    if (startMonth > 12) {
      startMonth = 1;
      ++year;
    }
    //
    let newDate = new Date(year, startMonth - 1);
    let arDate = [];
    while (newDate.getMonth() === startMonth - 1) {
      arDate.push({
        date: newDate.getDate(),
        day: newDate.getDay()
      });
      newDate.setDate(newDate.getDate() + 1);
    }
    //
    objDate.year = year;
    objDate.month = startMonth;
    objDate.date = arDate;
    //
    data.push(objDate);
  }

  return data;
};

// const INIT_DATA = [
//   {
//     year: 2020,
//     month: 1,
//     week: [
//       {
//         date: 1,
//         order: [
//           {
//             order_id: 1
//           }
//           // .. {order_id} ...
//         ]
//       }
//       // ... {date order}, ...
//     ],
//   }
//   //... {year month date}, ...
// ];
