/* eslint-disable max-len */
import {addressPoints} from '../Testing_heatmap/heatmap';
import {realtime} from './Realtime';
import {response} from './chart';
import {randomChartData} from './randomChartData';

// chart Data from sample Data
export const getMockChartData = async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(100);
  return response;
};
export const getMockRealtimeData = async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(100);
  return realtime;
};

export const addData = () => {
  const devices = [
    'LM13',
    'LM34',
    'S38',
    'S26',
    'S36',
    'LM28',
    'RM20',
    'RM15',
    'RM19',
    'RM21',
    'S41',
  ];
  const randomRH = Math.floor(Math.random() * 10000) / 100;
  const randomTemp = Math.floor(Math.random() * 10000) / 100;
  const randomSPM1 = Math.floor(Math.random() * 10000) / 100;
  const randomSPM2 = Math.floor(Math.random() * 10000) / 100;
  const max1 = 80.294808;
  const min1 = 80.104607;
  const max2 = 80.294808;
  const min2 = 80.104607;
  const randomLang = (Math.random() * (max1 - min1 + 0.000001) + min1).toFixed(
      6,
  );
  const randomLat = (Math.random() * (max2 - min2 + 0.000001) + min2).toFixed(
      6,
  );
  const finalLng = parseFloat(randomLang);
  const finalLat = parseFloat(randomLat);
  const currTime = Date.now();
  const RandomIndex = Math.random() * 13;
  const generatedData = {
    srvtime: currTime,
    value: {
      rh: randomRH,
      temp: randomTemp,
      sPM1: randomSPM1,
      sPM2: randomSPM2,
      long: finalLng,
      lat: finalLat,
      dID: devices[RandomIndex],
    },
  };
  return generatedData;
};

const assignSeconds=async (time)=>{
  let seconds;
  switch (time) {
    case '15M':
      console.log('15min conversion');
      seconds=900000;
      break;
    case '1H':
      seconds=3600000;
      break;
    case '3H':
      seconds=10800000;
      break;
    case '1D':
      seconds=216000000;
      break;
  }
  console.log(seconds);
  return seconds;
};

export const generateHeatMapData=async ()=>{
  // for (let i=0; i<10; i++) {
  //   const max1 = 12.969004;
  //   const min1 = 13.037914;
  //   const max2 = 80.198923;
  //   const min2 = 80.269133;
  //   const randomLang=(Math.random()*(max1 - min1 + 0.000001) + min1).toFixed(6);
  //   const randomLat=(Math.random()*(max2 - min2 + 0.000001) + min2).toFixed(6);
  //   const finalLng = parseFloat(randomLang);
  //   const finalLat = parseFloat(randomLat);
  //   const randomVal = (Math.random() * (max1 - min1 + 1) + min1).toFixed(2);
  //   addressPoints.push([finalLng, finalLat, randomVal]);
  // }
  response.map((item)=>{
    for (let i=0; i<1; i++) {
      const randomVal=(Math.floor((Math.random() * (60 - 20) + 20)*100)/100);
      addressPoints.sPM1.push([item.value.lat, item.value.lon, randomVal.toString()]);
      addressPoints.sPM2.push([item.value.lat, item.value.lon, item.value.sPM2]);
      addressPoints.sPM10.push([item.value.lat, item.value.lon, item.value.sPM10]);
      addressPoints.temp.push([item.value.lat, item.value.lon, item.value.temp]);
      addressPoints.humidity.push([item.value.lat, item.value.lon, item.value.rh]);
    }
  });
  console.log(addressPoints);
};

const generateRandomChartData=async (queryDevices, time)=>{
  console.log(time);
  const seconds=await assignSeconds(time);
  console.log(seconds);
  queryDevices.map((item)=>{
    const currDeviceData={
      'status': 200,
      'dID': item,
      'data': [],
    };
    for (let i=0, j=7; i<8; i++, j--) {
      const obj={
        'sPM2': Math.floor((Math.random() * (40 - 20) + 20)*100)/100,
        'sPM1': Math.floor((Math.random() * (40 - 20) + 20)*100)/100,
        'sPM10': Math.floor((Math.random() * (40 - 20) + 20)*100)/100,
        'rh': Math.floor((Math.random() * (50 - 40) + 40)*100)/100,
        'temp': Math.floor((Math.random() * (40 - 30) + 30)*100)/100,
        'srvtime': Date.now()-(j*seconds),
      };
      currDeviceData.data.push(obj);
    }
    randomChartData.data.push(currDeviceData);
  });
};

// export const individualChartData=async(deviceName)=>{
//   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//   await delay(1000);
//   const currDeviceData={
//     "status": 200,
//     "dID": deviceName,
//     "data": [],
// }
// for(let i=0,j=7;i<8;i++,j--){
//     const obj={
//       "sPM2": Math.floor((Math.random() * (40 - 20) + 20)*100)/100,
//       "sPM1": Math.floor((Math.random() * (40 - 20) + 20)*100)/100,
//       "sPM10": Math.floor((Math.random() * (40 - 20) + 20)*100)/100,
//       "rh": Math.floor((Math.random() * (50 - 40) + 40)*100)/100,
//       "temp": Math.floor((Math.random() * (40 - 30) + 30)*100)/100,
//       "srvtime": Date.now()-(j*seconds)
//   }
//   currDeviceData.data.push(obj);
//   }
//   singleChartData.data=currDeviceData
// }

export const getComparisonChartData = async (query, time) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1000);
  const queryDevices=query.split(';');
  console.log(queryDevices);
  randomChartData.data=[];
  console.log(time);
  await generateRandomChartData(queryDevices, time);
  const finalObj = randomChartData.data.filter((item)=>{
    return queryDevices.includes(item.dID);
  });
  finalObj.map((item) => {
    const averagedPM1 = [];
    const averagedPM2 = [];
    const averageTemp = [];
    const averageRh = [];
    const averagedPM10 = [];
    console.log(item);
    item.data.map((items) => {
      averagedPM1.push(items.sPM1);
      averagedPM2.push(items.sPM2);
      averageTemp.push(items.temp);
      averageRh.push(items.rh);
      averagedPM10.push(items.sPM10);
    });
    item.min = {
      'sPM2': Math.min(...averagedPM2),
      'sPM1': Math.min(...averagedPM1),
      'sPM10': Math.min(...averagedPM10),
      'rh': Math.min(...averageRh),
      'temp': Math.min(...averageTemp),
    };
    item.max = {
      'sPM2': Math.max(...averagedPM2),
      'sPM1': Math.max(...averagedPM1),
      'sPM10': Math.max(...averagedPM10),
      'rh': Math.max(...averageRh),
      'temp': Math.max(...averageTemp),
    };
  });
  // let data={};
  return finalObj;
};
