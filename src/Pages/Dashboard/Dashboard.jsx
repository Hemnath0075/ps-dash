/* eslint-disable react/prop-types */
/* eslint-disable max-len */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './Dashboard.module.css';
import OutsideClickHandler from 'react-outside-click-handler';
import {
  Map,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  LayersControl,
  LayerGroup,
  CircleMarker,
} from 'react-leaflet';
import {MdArrowDropDown, MdArrowDropUp} from 'react-icons/md';
import ReactCardFlip from 'react-card-flip';
import * as L from 'leaflet';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// import MenuIcon from '@mui/icons-material/Menu';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import 'react-toastify/dist/ReactToastify.css';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as Tooltips,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import useWebSocket from 'react-use-websocket';
// import { addData, getChartData } from "../../Mock_Backend/Backend";
// import { MenuBook } from "@mui/icons-material";
// import { ReadyState } from "react-use-websocket";
import {useDispatch, useSelector} from 'react-redux';
import {
  dashboardData,
  updateData,
} from '../../redux/Features/DataSlice';
import {
  getComparisonChartData,
  getMockRealtimeData,
} from '../../Mock_Backend/Backend';
import Navbar from '../../Components/Navbar';
import {ToastContainer, toast} from 'react-toastify';

// const optionsBtn = [
//   {value: 'showAllDevices', label: 'Show All Devices'},
//   {value: 'hideAllMarkers', label: 'Hide All Markers'},
// ];

// import {components} from 'react-select';

// const Option = (props) => {
//   // const [option1,setOption1]=useState(false);
//   // const [option1,setOption1]=useState(false);
//   return (
//     <div>
//       <components.Option {...props}>
//         {console.log(props)}
//         <input
//           type="checkbox"
//           checked={props.isSelected}
//           // onChange={(e) => console.log(e)}
//           // id='checkbox'
//           // onClick={(e)=> console.log(e.target.value)}
//         />{' '}
//         <label >{props.children}</label>
//       </components.Option>
//     </div>
//   );
// };

/**
 * @return {Component}
 */
function Dashboard() {
  const toastID='heatmap';
  const optionsRef=useRef();
  const options = [
    {value: 'sPM1', label: 'PM 1'},
    {value: 'sPM2', label: 'PM 2'},
    {value: 'sPM10', label: 'PM 10'},
    {value: 'temp', label: 'TEMP'},
    {value: 'humidity', label: 'HUMIDITY'},
    {value: 'None', label: 'NONE'},
  ];
  // const [option, setOption] = useState(options[0]);
  const {Overlay} = LayersControl;
  const overlayRef = useRef();
  console.log(overlayRef);
  const [showOptions, setShowOptions]=useState(false);
  const backend = useSelector((state) => state.data.backend);
  const marker = useSelector((state) => state.data.markers);
  const dispatch = useDispatch();
  const deviceData = useSelector((state) => state.data.data);
  console.log(deviceData);
  const dashboardRealtimeData = useSelector(
      (state) => state.data.dashBoardRealtimeData,
  );
  const [currentMapLocation, setCurrentMapLocation] = useState([
    13.15006, 80.266246,
  ]);
  console.log(dashboardRealtimeData);
  const [timeFrame, setTimeFrame] = useState('15M');
  const devices = useSelector((state) => state.data.devices);
  const [circleData, setCircleData]=useState();
  // const [optionBtn, setOptionBtn]=useState();
  // eslint-disable-next-line no-unused-vars
  const [showMarkers, setShowMarkers]=useState(true);
  const [type1, setType1] = useState(true);
  const [type2, setType2] = useState(false);
  const [type3, setType3] = useState(false);
  const [type4, setType4] = useState(false);
  const [type5, setType5] = useState(false);
  const [gridDataIndex, setGridDataIndex] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartDevice, setChartDevice] = useState();
  // const [chartData,setChartData]=useState([])
  const ChangeTimeFrame = (e) => {
    console.log(e.target.value);
    setTimeFrame(e.target.value);
    getChartData(chartDevice, e.target.value);
    setIsChartLoading(true);
    setType1(true);
    setType2(false);
    setType3(false);
    setType4(false);
    setType5(false);
  };
  const showAllDeviceNotify = () => toast('Disable Show All Devices to See Individual Devices');
  const hideAllMarkersNotify = () => toast('Disable Hide All Markers to See All Markers');
  const hideHeatmapNotify = () => {
    toast('Select None to Hide Circle Markers',
        {toastId: toastID});
  };
  const getSocketUrl = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('wss://bw06.kaatru.org/realtime?devices=' + devices);
      }, 2000);
    });
  }, []);

  const {} = useWebSocket(getSocketUrl, {
    onOpen: (_data) => {
      console.log('WebSocket connection established.');
    },
    onMessage: (response) => {
      const mes = JSON.parse(response.data);
      console.log(mes);
      console.log(data);
      if (backend) {
        dispatch(dashboardData(mes.data));
        dispatch(updateData(mes.data));
      }
    },
    shouldReconnect: (_closeEvent) => true,
  });
  const [option1, setOption1]=useState(false);
  const [option2, setOption2]=useState(false);
  const [chartData, setChartData] = useState();
  const [nullData, setNullData] = useState(false);
  const slideRef = useRef();
  const mapRef = useRef();
  const [flipped, setFlipped] = useState(false);
  const [toggleBtn, setToggleBtn] = useState(false);
  const sliderSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    beforeChange: (_item, a) => {
      slideisgoingtochange(a);
    },
  };
  const slideisgoingtochange = (index) => {
    const {current = {}} = mapRef;
    const {leafletElement: map} = current;
    setGridDataIndex(index);
    console.log(data);
    if (data[index]?.value !== undefined) {
      setCurrentMapLocation([data[index].value.lat, data[index].value.lon]);
      if (data[index].value.lat !== 0 && data[index].value.lon !== 0) {
        map.flyTo([data[index].value.lat, data[index].value.lon], 15, {
          duration: 2,
        });
      }
    }
  };

  const getChartData = async (deviceName, time) => {
    setType1(true);
    setType2(false);
    setType3(false);
    setType4(false);
    setType5(false);
    try {
      console.log(time);
      if (time == undefined) {
        time = '15M';
      }
      setChartDevice(deviceName);
      let reqData;
      console.log(deviceName);
      if (backend) {
        reqData = await axios
            .get(
                `https://bw06.kaatru.org/stale/filter?devices=${deviceName}&filter=${time}`,
            )
            .then((value) => value.data.data);
      } else {
        reqData = await getComparisonChartData(deviceName, time);
      }
      console.log(reqData);
      let nullData=0;
      reqData[0].data.map((item)=>{
        if (item.sPM1 === null) {
          nullData=nullData+1;
        }
      });
      if (nullData===8) {
        setNullData(true);
      }
      console.log(nullData);
      reqData[0].data.map((item) => {
        console.log(item.srvtime);
        if (item.srvtime !== undefined) {
          let day; let timeStamps;
          if (backend) {
            timeStamps = item.srvtime;
          } else {
            timeStamps=item.srvtime;
          }
          console.log(timeStamps);
          const date = new Date(timeStamps).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
          });
          console.log(date);
          const timeInHours = date.split(',')[1].split(' ')[1];
          const timeFrames = timeInHours.split(':');
          const finalTime = timeFrames[0] + ':' + timeFrames[1];
          if (time == '3H' || time == '1D') {
            day = date.split(',')[0].split('/');
            item.x_axis = day[1] + '/' + day[0] + ' ' + finalTime;
          } else {
            item.x_axis = finalTime;
          }
        }
      });
      // reqData.data.data[0].map((item)=>{
      //   console.log(item.max)
      // })
      console.log(reqData);
      setChartData(reqData[0]);
    } catch (err) {
      console.log('something went wrong' + err);
    } finally {
      console.log('got the data');
      setIsChartLoading(false);
    }
  };
  // console.log(data)
  const getRealtime = async () => {
    const realtime = await getMockRealtimeData();
    console.log(realtime);
    // eslint-disable-next-line guard-for-in
    for (const i in realtime) {
      dispatch(dashboardData(realtime[i]));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log('first');
    }
    getRealtime();
  };
  console.log(currentMapLocation);

  useEffect(() => {
    const assignData = async () => {
      try {
        console.log(deviceData);
        const markersArr = [];
        deviceData.map((item) => {
          if (item.value !== undefined) {
            markersArr.push([item.value.lat, item.value.lon]);
          }
        });
        console.log(markersArr);
        setData(deviceData);
        if (!backend) {
          getRealtime();
        }
      } catch (err) {
        console.log('something went wrong' + err);
      } finally {
        console.log('done done !!!');
        setIsLoading(false);
      }
    };
    assignData();
    console.log('inside useEffect');
  }, []);
  const bounds = useMemo(() => {
    const b = L.latLngBounds();
    console.log(marker);
    if (marker.length == 0) {
      [[13.000564, 80.228634], [13.030010, 80.252646]].forEach((coords) => {
        b.extend(coords);
      });
      // setComparison(false);
    } else {
      marker.forEach((coords) => {
        b.extend(coords);
      });
    }
    return b;
  }, [marker]);

  const showHeatmap = () => {
    console.log(mapRef);
    slideRef.current.slickPause();
    console.log('leaflet heatmap must be shown');
    if (mapRef.current && overlayRef.current) {
      const map = mapRef.current.leafletElement;
      const firstLayer = overlayRef.current.leafletElement;
      [firstLayer].forEach((layer) => map.addLayer(layer));
    }
  };

  const hideHeatmap=()=>{
    // setHeatmap(false);
    slideRef.current.slickPlay();
    if (mapRef.current && overlayRef.current) {
      const map = mapRef.current.leafletElement;
      const firstLayer = overlayRef.current.leafletElement;
      [firstLayer].forEach((layer) => map.removeLayer(layer));
    }
  };
  const getColor=(item)=>{
    console.log(item.value?.sPM1);
    if (circleData==='sPM1') {
      if (item.value?.sPM1>35 && item.value?.sPM1<40) {
        return 'red';
      } else if (item.value?.sPM1>25 && item.value?.sPM1<35) {
        return 'orange';
      } else if (item.value?.sPM1>20 && item.value?.sPM1<25) {
        return 'green';
      }
    }
    if (circleData==='sPM2') {
      if (item.value.sPM2>35 && item.value.sPM2<40) {
        return 'red';
      } else if (item.value.sPM2>25 && item.value.sPM2<35) {
        return 'orange';
      } else if (item.value.sPM2>20 && item.value.sPM2<25) {
        return 'green';
      }
    }
    if (circleData==='sPM10') {
      if (item.value.sPM10>35 && item.value.sPM10<40) {
        return 'red';
      } else if (item.value.sPM10>25 && item.value.sPM10<35) {
        return 'orange';
      } else if (item.value.sPM10>20 && item.value.sPM10<25) {
        return 'green';
      }
    }
    if (circleData==='temp') {
      if (item.value.temp>36 && item.value.temp<40) {
        return 'red';
      } else if (item.value.temp>33 && item.value.temp<36) {
        return 'orange';
      } else if (item.value.temp>30 && item.value.temp<33) {
        return 'green';
      }
    }
    if (circleData==='humidity') {
      if (item.value.rh>46 && item.value.rh<50) {
        return 'red';
      } else if (item.value.rh>43 && item.value.rh<46) {
        return 'orange';
      } else if (item.value.rh>40 && item.value.rh<43) {
        return 'green';
      }
    }
  };
  // useEffect(()=>{
  //   if (optionBtn!==undefined) {
  //     if (optionBtn.value==='showAllDevices') {
  //       const map = mapRef.current.leafletElement;
  //       map.flyToBounds(bounds);
  //       setToggleBtn(!toggleBtn);
  //       if (toggleBtn) {
  //         if (mapRef.current && overlayRef.current) {
  //           const map = mapRef.current.leafletElement;
  //           const firstLayer = overlayRef.current.leafletElement;
  //           [firstLayer].forEach((layer) =>
  //             map.removeLayer(layer),
  //           );
  //         }
  //         slideRef.current.slickPlay();
  //       } else {
  //         slideRef.current.slickPause();
  //       }
  //     } else if (optionBtn.value==='hideAllMarkers') {
  //       setShowMarkers(!showMarkers);
  //     }
  //   }
  // }, optionBtn);


  return (
    <>
      <div className={styles.container}>
        <Navbar />
        <div className={styles.content}>
          <Box sx={{display: 'flex'}} className={styles.loading_div}>
            {isLoading && <CircularProgress />}
          </Box>
          {!isLoading && (
            <div
              className={`${styles.left_content} ${isLoading && styles.opacity}`}
            >
              <div className="map" id="map">
                <div className={styles.Map_nav}>
                  <h3 className={styles.map_heading}>DEVICE LOCATIONS</h3>
                  <div className={styles.load_btn_container}>
                    <div className={styles.load_btn_container}>
                      <div className="" style={{position: 'relative', width: '40%'}}>
                        <OutsideClickHandler
                          onOutsideClick={() => {
                            setShowOptions(false);
                          }}
                        >
                          <button className={styles.option_btn} ref={optionsRef} onClick={()=>setShowOptions(!showOptions)}>Options {!showOptions?<MdArrowDropDown className={styles.dropdown_icon} size={25}/>:<MdArrowDropUp className={styles.dropdown_icon} size={25}/>}</button>
                          {showOptions&&<div className={styles.options_div}>
                            <div className={styles.option_item}>
                              <input type="checkbox" name="" id="show" checked={option1} placeholder='Show All Devices' onClick={()=>{
                                setOption1(!option1);
                                setOption2(false);
                                const map = mapRef.current.leafletElement;
                                map.flyToBounds(bounds);
                                setToggleBtn(!toggleBtn);
                                if (toggleBtn) {
                                  if (mapRef.current && overlayRef.current) {
                                    const map = mapRef.current.leafletElement;
                                    const firstLayer = overlayRef.current.leafletElement;
                                    [firstLayer].forEach((layer) =>
                                      map.removeLayer(layer),
                                    );
                                  }
                                  toast.dismiss();
                                  slideRef.current.slickPlay();
                                } else {
                                  showAllDeviceNotify();
                                  setShowMarkers(true);
                                  slideRef.current.slickPause();
                                }
                              }}/>
                              <label htmlFor="show" style={{cursor: 'pointer', fontSize: '2vmin', fontWeight: 'normal'}}>Show All Devices</label>
                            </div>
                            <div className={styles.option_item}>
                              <input type="checkbox" name="" id="hide" checked={option2} placeholder='Show All Devices' onClick={()=>{
                                setOption1(false);
                                setOption2(!option2);
                                setShowMarkers(!showMarkers);
                                setCircleData('sPM1');
                                if (option2) {
                                  toast.dismiss();
                                  hideHeatmap();
                                  setCircleData(undefined);
                                } else {
                                  hideAllMarkersNotify();
                                  showHeatmap();
                                }
                              }}/>
                              <label htmlFor="hide" style={{cursor: 'pointer', fontSize: '2vmin', fontWeight: 'normal'}}>Hide All Markers</label>
                            </div>
                          </div>}
                        </OutsideClickHandler>
                      </div>
                    </div>
                  </div>
                </div>
                <Map
                  center={[12.992908, 80.235399]}
                  zoom={15}
                  scrollWheelZoom={true}
                  ref={mapRef}
                  onPopupClose={() => {
                    slideRef.current.slickPlay();
                    setFlipped(!flipped);
                  }}
                  className={styles.map}
                >
                  {(circleData!==undefined) && <div className={styles.legend_div}>
                    <p>{circleData}</p>
                    <div className={styles.legend_content}>
                      <div className={styles.legend_item}>
                        <div className={styles.color_div}
                          style={{backgroundColor: 'red',
                            width: '2vmin',
                            height: '2vmin',
                          }}>
                        </div>
                        <p>{(circleData==='temp')?'36-40':
                      (circleData==='humidity')?'46-50':'35-40'}</p>
                      </div>
                      <div className={styles.legend_item}>
                        <div className={styles.color_div}
                          style={{backgroundColor: 'orange',
                            width: '2vmin',
                            height: '2vmin',
                          }}>
                        </div>
                        <p>{(circleData==='temp')?'33-36':
                      (circleData==='humidity')?'43-46':'25-35'}</p>
                      </div>
                      <div className={styles.legend_item}>
                        <div className={styles.color_div}
                          style={{backgroundColor: 'green',
                            width: '2vmin',
                            height: '2vmin',
                          }}>
                        </div>
                        <p>{(circleData==='temp')?'30-33':
                      (circleData==='humidity')?'40-43':'20-25'}</p>
                      </div>
                    </div>
                  </div>}
                  <div className="">
                    <Dropdown options={options} onChange={(e)=>{
                      console.log(e.value);
                      if (e.value==='None') {
                        setCircleData(undefined);
                        hideHeatmap();
                        toast.dismiss();
                      } else {
                        const map = mapRef.current.leafletElement;
                        map.flyToBounds(bounds);
                        if (e.value==='sPM1') {
                          setCircleData('sPM1');
                        } else if (e.value==='sPM2') {
                          setCircleData('sPM2');
                        } else if (e.value==='sPM10') {
                          setCircleData('sPM10');
                        } else if (e.value==='temp') {
                          setCircleData('temp');
                        } else if (e.value==='humidity') {
                          setCircleData('humidity');
                        }
                        console.log(circleData);
                        if (toast.isActive(toastID)) {
                          console.log('already there');
                        }
                        hideHeatmapNotify();
                        showHeatmap();
                      }
                    }} placeholder="Heatmap" className={styles.inner_map_dropdown}/>
                  </div>
                  <TileLayer
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                    url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                  />
                  {showMarkers && data?.map((item) => {
                    return (
                      <Marker
                        position={[item.value?.lat || 0, item.value?.lon || 0]}
                        onClick={() => {
                          slideRef.current.slickPause();
                          setFlipped(!flipped);
                          setIsChartLoading(true);
                          getChartData(item.device, timeFrame);
                          const index = data.findIndex((element) => element.device === item.device);
                          setGridDataIndex(index);
                          if (slideRef.current && index >= 0 && index < data.length) {
                            // Call the slickGoTo method to set the carousel to the desired index
                            slideRef.current.slickGoTo(index);
                          }
                        }}
                        key={item.device}
                      // className={showMarkers?'':styles.hideMarkers}
                      >
                        <Popup>
                        You are viewing {item.device} <br /> Close this popup to
                        see others..
                        </Popup>
                        <Tooltip permanent>
                          <p className={styles.tooltip}>{item.device}</p>
                        </Tooltip>
                      </Marker>
                    );
                  })}
                  <LayersControl position="topright">
                    <Overlay name="Heatmap">
                      <LayerGroup ref={overlayRef}>
                        {data.map((item)=>{
                          return (
                            <CircleMarker
                              center={
                                [item.value?.lat || 0, item.value?.lon || 0]
                              }
                              color={getColor(item)}
                              radius={10}
                              key={item.device}>
                            </CircleMarker>
                          );
                        })}
                      </LayerGroup>
                    </Overlay>
                  </LayersControl>
                </Map>
              </div>
            </div>
          )}
          {!isLoading && (
            <div
              className={`${styles.right_content} ${isLoading && styles.opacity}`}
            >
              <div className={styles.top_div}>
                {!flipped && (
                  <h3 className={styles.carousel_content}>AGGREGATE</h3>
                )}

                <ReactCardFlip
                  isFlipped={flipped}
                  flipDirection="horizontal"
                  className={styles.top_div_flip}
                >
                  <div className={styles.top_grid}>
                    <div className={styles.campus_grid_left}>
                      <div className={styles.large_grid_items}>
                        <div className={styles.large_grid_items_inner_div}>
                          <div className={styles.large_grid_contents}>
                            <p className={styles.parameter}>PM 2.5</p>
                          </div>
                          <div className={styles.large_grid_values}>
                            <p className={styles.parameter}>
                              {dashboardRealtimeData.sPM2}
                              <span> μg/m3</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.campus_grid_right}>
                      <div className={styles.first_row}>
                        <div className={styles.small_grid_items}>
                          <div className={styles.small_grid_items_inner_div}>
                            <div className={styles.small_grid_contents}>
                              <p className={styles.parameter}>Temperature</p>
                            </div>
                            <div className={styles.small_grid_values}>
                              <p className={styles.parameter}>
                                {dashboardRealtimeData.temp}
                                <span> °C</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={styles.small_grid_items}>
                          <div className={styles.small_grid_items_inner_div}>
                            <div className={styles.small_grid_contents}>
                              <p className={styles.parameter}>Humidity</p>
                            </div>
                            <div className={styles.small_grid_values}>
                              <p className={styles.parameter}>
                                {dashboardRealtimeData.rh}
                                <span> %</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.second_row}>
                        <div className={styles.small_grid_items}>
                          <div className={styles.small_grid_items_inner_div}>
                            <div className={styles.small_grid_contents}>
                              <p className={styles.parameter}>PM 1</p>
                            </div>
                            <div className={styles.small_grid_values}>
                              <p className={styles.parameter}>
                                {dashboardRealtimeData.sPM1}
                                <span> μg/m3</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={styles.small_grid_items}>
                          <div className={styles.small_grid_items_inner_div}>
                            <div className={styles.small_grid_contents}>
                              <p>PM 10</p>
                            </div>
                            <div className={styles.small_grid_values}>
                              <p className={styles.parameter}>
                                {dashboardRealtimeData.sPM10}
                                <span> μg/m3</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{width: '100%', height: '100%'}}>
                    <Box
                      sx={{display: 'flex'}}
                      className={styles.chart_loading_div}
                    >
                      {isChartLoading && <CircularProgress />}
                    </Box>
                    {!isChartLoading && (
                      <div className={styles.checkbox_div}>
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
                          </label>
                          <label style={{display: 'flex', gap: '3px'}}>
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
                    )}
                    {(!isChartLoading && !nullData ) && (
                      <ResponsiveContainer width="100%" height="90%">
                        <LineChart
                          width={500}
                          height={300}
                          data={chartData.data}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="x_axis"
                            allowDuplicatedCategory={true}
                            interval={0}
                          />
                          <YAxis
                            domain={
                            type1 ?
                              [chartData.min.sPM1 - 1, chartData.max.sPM1 + 1] :
                              type2 ?
                              [chartData.min.sPM2 - 1, chartData.max.sPM2 + 1] :
                              type3 ?
                              [
                                chartData.min.sPM10 - 1,
                                chartData.max.sPM10 + 1,
                              ] :
                              type4 ?
                              [chartData.min.temp - 1, chartData.max.temp + 1] :
                              [chartData.min.rh - 1, chartData.max.rh + 1]
                            }
                            tickCount={7}
                          />
                          <Tooltips />
                          <Legend />
                          {type1 && (
                            <Line
                              type="monotone"
                              dataKey="sPM1"
                              stroke="#b7b7c0"
                              activeDot={{r: 8}}
                              strokeWidth={3}
                              connectNulls
                            />
                          )}
                          {type2 && (
                            <Line
                              type="monotone"
                              dataKey="sPM2"
                              stroke="#82ca9d"
                              strokeWidth={3}
                            />
                          )}
                          {type3 && (
                            <Line
                              type="monotone"
                              dataKey="sPM10"
                              stroke="#0ce25e"
                              strokeWidth={3}
                            />
                          )}
                          {type4 && (
                            <Line
                              type="monotone"
                              dataKey="temp"
                              stroke="#04d5f1"
                              strokeWidth={3}
                            />
                          )}
                          {type5 && (
                            <Line
                              type="monotone"
                              dataKey="rh"
                              stroke="#ce3b05"
                              strokeWidth={3}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                    {(!isChartLoading && nullData ) &&(
                      <div className={styles.nullData}>
                        <h2 className="">
                      Oops! There is no Data On this Device..
                        </h2>
                      </div>
                    )}
                  </div>
                </ReactCardFlip>
              </div>
              <div className={styles.bottom_div}>
                <div className={styles.carousel_tag}>
                  <Slider {...sliderSettings} ref={slideRef}>
                    {data?.map((item) => {
                      return (
                        <div className={styles.center_content} key={item.srvtime}>
                          <h3 className={styles.carousel_content}>
                            {(backend ? item.location : item.value.location) +
                            `  (${item.device})`}
                          </h3>
                        </div>
                      );
                    })}
                  </Slider>
                </div>
                <div className={styles.bottom_grid}>
                  <div className={styles.campus_grid_left}>
                    <div className={styles.large_grid_items}>
                      <div className={styles.large_grid_items_inner_div}>
                        <div className={styles.large_grid_contents}>
                          <p className={styles.parameter}>PM {2.5}</p>
                        </div>
                        <div className={styles.large_grid_values}>
                          <p className={styles.parameter}>
                            {data[gridDataIndex]?.value?.sPM2 || '-'}
                            <span> μg/m3</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.campus_grid_right}>
                    <div className={styles.first_row}>
                      <div className={styles.small_grid_items}>
                        <div className={styles.small_grid_items_inner_div}>
                          <div className={styles.small_grid_contents}>
                            <p className={styles.parameter}>PM 1</p>
                          </div>
                          <div className={styles.small_grid_values}>
                            <p className={styles.parameter}>
                              {data[gridDataIndex]?.value?.sPM1 || '-'}
                              <span> μg/m3</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={styles.small_grid_items}>
                        <div className={styles.small_grid_items_inner_div}>
                          <div className={styles.small_grid_contents}>
                            <p className={styles.parameter}>PM 10</p>
                          </div>
                          <div className={styles.small_grid_values}>
                            <p className={styles.parameter}>
                              {data[gridDataIndex]?.value?.sPM10 || '-'}
                              <span> μg/m3</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.second_row}>
                      <div className={styles.small_grid_items}>
                        <div className={styles.small_grid_items_inner_div}>
                          <div className={styles.small_grid_contents}>
                            <p className={styles.parameter}>Temperature</p>
                          </div>
                          <div className={styles.small_grid_values}>
                            <p className={styles.parameter}>
                              {data[gridDataIndex]?.value?.temp || '-'}
                              <span> °C</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={styles.small_grid_items}>
                        <div className={styles.small_grid_items_inner_div}>
                          <div className={styles.small_grid_contents}>
                            <p className={styles.parameter}>Humidity</p>
                          </div>
                          <div className={styles.small_grid_values}>
                            <p className={styles.parameter}>
                              {data[gridDataIndex]?.value?.rh || '-'}
                              <span> %</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position='top-right' closeOnClick autoClose={false}/>
    </>
  );
}

export default Dashboard;
