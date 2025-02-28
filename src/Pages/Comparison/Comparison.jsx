/* eslint-disable max-len */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import styles from './Comparison.module.css';
import {
  Map,
  TileLayer,
  Marker,
  Tooltip,
} from 'react-leaflet';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// import MenuIcon from '@mui/icons-material/Menu';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as Tooltips,
  ResponsiveContainer,
} from 'recharts';
// import HeatmapLayer from "react-leaflet-heatmap-layer/lib/HeatmapLayer";
import axios from 'axios';
// import { addData, getChartData } from "../../Mock_Backend/Backend";
// import { MenuBook } from "@mui/icons-material";
import {useDispatch, useSelector} from 'react-redux';
import {
  addSelectedDevice,
  comparisonAddChartData,
  removeAllDevices,
  removeComparisionChart,
  removeSelectedDevice,
} from '../../redux/Features/DataSlice';
import {getComparisonChartData, getMockChartData}
  from '../../Mock_Backend/Backend';
import randomColor from 'randomcolor';
import Navbar from '../../Components/Navbar';
import * as L from 'leaflet';

/**
 Comaprison page
 @return {Component}
 */
function Comparison() {
  const marker = useSelector((state) => state.data.markers);
  const backend=useSelector((state)=>state.data.backend);
  const devicesStr = '';
  const emptyChart = [
    {
      x_axis: '10:00',
    },
    {
      x_axis: '11:00',
    },
    {
      x_axis: '12:00',
    },
    {
      x_axis: '1:00',
    },
    {
      x_axis: '2:00',
    },
    {
      x_axis: '3:00',
    },
    {
      x_axis: '5:00',
    },
  ];
  const dispatch = useDispatch();
  const deviceData = useSelector((state) => state.data.data);
  const selectedDeviceData = useSelector(
      (state) => state.data.selectedDeviceData,
  );
  // console.log(selectedDeviceData)
  const comparisonChartData = useSelector(
      (state) => state.data.comparisonChartData,
  );
  console.log(comparisonChartData);
  const [timeFrame, setTimeFrame] = useState('15M');
  const [type1, setType1] = useState(true);
  const [type2, setType2] = useState(false);
  const [type3, setType3] = useState(false);
  const [type4, setType4] = useState(false);
  const [type5, setType5] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const ChangeTimeFrame = (e) => {
    console.log(e.target.value);
    setTimeFrame(e.target.value);
    getChartData(e.target.value);
    setIsChartLoading(true);
  };

  // const [chartData, setChartData] = useState();
  const mapRef = useRef();
  const [finalMinMax, setFinalMinMax] = useState();
  const markerClicked = (device) => {
    if (selectedDeviceData.length > 0) {
      const isAvailable = selectedDeviceData.find(
          (item) => item.deviceId == device,
      );
      console.log(isAvailable);
      if (isAvailable === undefined) {
        const data = {
          deviceId: device,
          color: randomColor(),
        };
        dispatch(addSelectedDevice(data));
      }
    } else {
      const data = {
        deviceId: device,
        color: randomColor(),
      };
      dispatch(addSelectedDevice(data));
    }
  };
  const getChartData = async (time) => {
    try {
      if (time == undefined) {
        time = '15M';
      }
      console.log(devicesStr);
      let devicesString = '';
      selectedDeviceData.map((item) => {
        devicesString += item.deviceId + ';';
      });
      const queryDevices = devicesString.substring(0, devicesString.length - 1);
      console.log(queryDevices);
      console.log(time);
      let chartData; let reqData;
      if (!backend) {
        chartData = await getComparisonChartData(queryDevices, time);
        console.log(chartData);
        reqData={
          data: chartData,
        };
      } else {
        reqData = await axios
            .get(
                `https://bw06.kaatru.org/stale/filter?devices=${queryDevices}&filter=${time}`,

            )
            .then((value) => value.data);
      }
      console.log(reqData);
      reqData.data.map((item) => {
        item.data.map((item1) => {
          let timeStamps;
          if (backend) {
            timeStamps = item1.srvtime;
          } else {
            timeStamps=item1.srvtime;
          }
          const date = new Date(timeStamps).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
          });
          console.log(date);
          let day;
          const timeInHours = date.split(',')[1].split(' ')[1];
          const timeFrames = timeInHours.split(':');
          const finalTime = timeFrames[0] + ':' + timeFrames[1];
          if (time=='3H' || time=='1D') {
            day=date.split(',')[0].split('/');
            item1.x_axis=day[1]+'/'+day[0]+'  '+finalTime;
          } else {
            item1.x_axis = finalTime;
          }
        });
      });
      const averageMindPM1 = [];
      const averageMindPM2 = [];
      const averageMinTemp = [];
      const averageMinRh = [];
      const averageMaxdPM1 = [];
      const averageMaxdPM2 = [];
      const averageMaxTemp = [];
      const averageMaxRh = [];
      reqData?.data.map((item) => {
        console.log('the item is here' + item);
        averageMindPM1.push(item.min.sPM1);
        averageMindPM2.push(item.min.sPM2);
        averageMinTemp.push(item.min.temp);
        averageMinRh.push(item.min.rh);
        averageMaxdPM1.push(item.max.sPM1);
        averageMaxdPM2.push(item.max.sPM2);
        averageMaxTemp.push(item.max.temp);
        averageMaxRh.push(item.max.rh);
      });

      const finalObj = {
        min: {
          sPM2: Math.min(averageMindPM2),
          sPM1: Math.min(averageMindPM1),
          rh: Math.min(averageMinRh),
          temp: Math.min(averageMinTemp),
        },
        max: {
          sPM2: Math.max(averageMaxdPM2),
          sPM1: Math.max(averageMaxdPM1),
          rh: Math.max(averageMaxRh),
          temp: Math.max(averageMaxTemp),
        },
      };
      setFinalMinMax(finalObj);
      console.log(finalMinMax);
      // setMinMax()
      // console.log(reqData.data.data[0]);
      dispatch(comparisonAddChartData(reqData.data));
      setChartData(reqData.data);
    } catch (err) {
      console.log('something went wrong' + err);
    } finally {
      console.log('got the data');
      setIsChartLoading(false);
    }
  };
  // console.log(finalMinMax);

  useEffect(() => {
    const assignData = async () => {
      try {
        if (!backend) {
          const mockData=await getMockChartData();
          console.log(mockData);
          setData(mockData);
        } else {
          setData(deviceData);
        }
      } catch (err) {
        console.log('something went wrong' + err);
      }
    };
    assignData();
    console.log('inside useEffect');
  }, []);

  const bounds = useMemo(() => {
    const b = L.latLngBounds();
    console.log(marker);
    marker.forEach((coords) => {
      b.extend(coords);
    });
    return b;
  }, [marker]);
  // console.log(data)
  // useEffect(() => {
  //   if (selectedDeviceData.length > 0) {
  //     getChartData();
  //   }
  // }, [selectedDeviceData]);
  return (
    <div className={styles.container}>
      <Navbar/>
      <div className={styles.content}>
        <Box sx={{display: 'flex'}} className={styles.loading_div}>
          {isLoading && <CircularProgress />}
        </Box>
        {!isLoading && (
          <div
            className={`${styles.left_content} ${isLoading && styles.opacity}`}
          >
            <div className="map" id="map">
              <h3 className={styles.map_heading}>DEVICE LOCATIONS</h3>
              <Map
                bounds={bounds}
                boundsOptions={{padding: [50, 50]}}
                zoom={12}
                scrollWheelZoom={true}
                ref={mapRef}
                className={styles.map}
              >
                <TileLayer
                  attribution= '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                />
                {data?.map((item) => {
                  return (
                    <Marker
                      position={[item.value?.lat || 0, item.value?.lon || 0]}
                      onClick={() => markerClicked(item.device)}
                      key={item.device}
                    >
                      <Tooltip permanent>
                        <p className={styles.tooltip}>{item.device}</p>
                      </Tooltip>
                    </Marker>
                  );
                })}
              </Map>
            </div>
          </div>
        )}
        {!isLoading && (
          <div
            className={`${styles.right_content} ${isLoading && styles.opacity}`}
          >
            <div className={styles.top_div}>
              {<h3>SELECTED DEVICES</h3>}
              <div className={styles.top_grid}>
                {!(selectedDeviceData.length > 0) &&
                <div className={styles.no_device_selected}>
                  <h3>Select any device from Map</h3>
                </div>}
                {selectedDeviceData.map((item, index) => (
                  <div className={styles.devices_div} key={item.deviceId}>
                    <p>{item.deviceId}</p>
                    <div
                      className={styles.color_notation}
                      style={{backgroundColor: `${item.color}`}}
                    ></div>
                    <div
                      className={styles.remove_device}
                      onClick={() => {
                        dispatch(removeSelectedDevice(index));
                        dispatch(removeComparisionChart(item.deviceId));
                      }}
                    >
                      X
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.load_btn_container}>
                <button className={selectedDeviceData.length > 0?styles.load_btn:styles.disabled_load_btn} onClick={()=>{
                  getChartData(timeFrame); setIsChartLoading(true);
                }} disabled={selectedDeviceData.length > 0? false : true}>Load Chart Data</button>
                {selectedDeviceData.length > 0 && <button className={styles.load_btn_red} onClick={()=>{
                  dispatch(removeAllDevices());
                }}>Remove All Devices</button>}
              </div>
            </div>
            <div className={styles.bottom_div}>
              <div className={styles.selected_device_container}>
                <div style={{width: '100%', height: '100%'}}>

                  <div className={styles.checkbox_div}>
                    <div className={styles.topRight_chart}>
                      <Box
                        sx={{position: 'relative'}}
                        className={styles.chart_loading_div}
                      >
                        {isChartLoading && <CircularProgress size={25}/>}
                      </Box>
                      <select
                        name=""
                        id=""
                        value={timeFrame}
                        onChange={ChangeTimeFrame}
                      >
                        <option selected value="15M">
                        15 Minutes
                        </option>
                        <option value="1H">1 Hour</option>
                        <option value="3H">3 Hours</option>
                        <option value="1D">1 Day</option>
                      </select>
                    </div>
                    <div className={styles.radiobtn_div}>
                      <label style={{display: 'flex', gap: '3px'}}>
                        <input
                          type="radio"
                          name="radio_btn"
                          className={styles.first_checkbox}
                          checked={type1}
                          onChange={() => {
                            setType1(true);
                            setType2(false);
                            setType3(false);
                            setType4(false);
                            setType5(false);
                          }}
                        />
                        {'PM 1'}
                      </label>
                      <label style={{display: 'flex', gap: '3px'}}>
                        <input
                          type="radio"
                          name="radio_btn"
                          onChange={() => {
                            setType2(true);
                            setType1(false);
                            setType3(false);
                            setType4(false);
                            setType5(false);
                          }}
                          style={{backgroundColor: '#000000'}}
                        />
                        {'PM 2.5'}
                      </label><label style={{display: 'flex', gap: '3px'}}>
                        <input
                          type="radio"
                          name="radio_btn"
                          onChange={() => {
                            setType2(false);
                            setType1(false);
                            setType3(true);
                            setType4(false);
                            setType5(false);
                          }}
                          style={{backgroundColor: '#000000'}}
                        />
                        {'PM 10'}
                      </label>
                      <label style={{display: 'flex', gap: '3px'}}>
                        <input
                          type="radio"
                          name="radio_btn"
                          onChange={() => {
                            setType2(false);
                            setType1(false);
                            setType3(false);
                            setType4(true);
                            setType5(false);
                          }}
                          style={{backgroundColor: '#000000'}}
                        />
                        {'Temp'}
                      </label>
                      <label style={{display: 'flex', gap: '3px'}}>
                        <input
                          type="radio"
                          name="radio_btn"
                          onChange={() => {
                            setType3(false);
                            setType1(false);
                            setType2(false);
                            setType4(false);
                            setType5(true);
                          }}
                        />
                        {'Humidity'}
                      </label>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      width={500}
                      height={300}
                      data={
                        comparisonChartData.length > 0 ?
                          comparisonChartData[0]?.data :
                          emptyChart
                      }
                      margin={{
                        top: 5,
                        right: 30,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x_axis" allowDuplicatedCategory={false} interval={0}/>
                      <YAxis
                        domain={
                          comparisonChartData.length > 0 ?
                            type1 ?
                              [
                                finalMinMax.min.sPM1 - 1,
                                finalMinMax.max.sPM1 + 1,
                              ] :
                              type2 ?
                              [
                                finalMinMax.min.temp - 1,
                                finalMinMax.max.temp + 1,
                              ] :
                              [finalMinMax.min.rh - 1, finalMinMax.max.rh + 1] :
                            [100, 200]
                        }
                        tickCount={7}
                      />
                      <Tooltips labelClassName="dID" label={comparisonChartData[0]?.dID === undefined ? null:'dID'}/>

                      {type1 &&
                        comparisonChartData.map((item, index) => (
                          <Line
                            type="monotone"
                            data={item.data}
                            dataKey="sPM1"
                            stroke={selectedDeviceData[index].color}
                            activeDot={{r: 8}}
                            strokeWidth={3}
                            key={item.data.dID}
                          />
                        ))}
                      {type2 &&
                        comparisonChartData.map((item, index) => (
                          <Line
                            type="monotone"
                            data={item.data}
                            dataKey="sPM2"
                            stroke={selectedDeviceData[index].color}
                            strokeWidth={3}
                            key={item.data.dID}
                          />
                        ))}
                      {type3 &&
                        comparisonChartData.map((item, index) => (
                          <Line
                            type="monotone"
                            data={item.data}
                            dataKey="sPM10"
                            stroke={selectedDeviceData[index].color}
                            strokeWidth={3}
                            key={item.data.dID}
                          />
                        ))}
                      {type4 &&
                        comparisonChartData.map((item, index) => (
                          <Line
                            type="monotone"
                            data={item.data}
                            dataKey="temp"
                            stroke={selectedDeviceData[index].color}
                            strokeWidth={3}
                            key={item.data.dID}
                          />
                        ))}
                      {type5 &&
                        comparisonChartData.map((item, index) => (
                          <Line type="monotone" key={item.data.dID} dataKey="rh" stroke={selectedDeviceData[index].color} strokeWidth={3} data={item.data} />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comparison;
