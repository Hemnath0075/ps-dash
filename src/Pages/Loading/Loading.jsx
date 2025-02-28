import React, {useCallback, useEffect, useState} from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import styles from '../Dashboard/Dashboard.module.css';
import axios from 'axios';
import useWebSocket from 'react-use-websocket';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {
  addData,
  addDeviceNames,
  addMarkers,
  dashboardData,
} from '../../redux/Features/DataSlice';
import {
  generateHeatMapData,
  getMockChartData,
} from '../../Mock_Backend/Backend';
import Navbar from '../../Components/Navbar';

const Loading = () => {
  const backend = useSelector((state) => state.data.backend);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let devices = '';
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const getSocketUrl = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('wss://bw06.kaatru.org/realtime?devices=' + devices);
      }, 2000);
    });
  }, []);
  const {} = useWebSocket(getSocketUrl, {
    onOpen: (data) => {
      console.log('WebSocket connection established.');
    },
    onMessage: (response) => {
      if (backend) {
        const mes = JSON.parse(response.data);
        console.log(mes);
        console.log(data);
        data.map((item) => {
          mes.data.idata.map((item1) => {
            console.log(item1.data.dID == item.device);
            if (item1.data.dID == item.device) {
              console.log(item1.data);
              item.value = item1.data;
            }
          });
        });
        console.log(data);
        setIsLoading(false);
        dispatch(addData(data));
        dispatch(addMarkers(data));
        dispatch(dashboardData(mes.data));
        if (isLoading) {
          navigate('/home', {state: {deviceData: data}}, {replace: true});
        }
      }
    },
    onClose: () => {
      console.log('connection closed');
    },
  });

  const getRealtime = async () => {
    const getMapData = await getMockChartData();
    dispatch(addMarkers(getMapData));
    dispatch(addData(getMapData));
    navigate('/home');
  };

  useEffect(() => {
    const getData = async () => {
      try {
        let getConfigData;
        if (backend) {
          getConfigData = await axios
              .get('https://bw06.kaatru.org/config')
              .then((value) => value.data.data);
          await generateHeatMapData();
        } else {
          getConfigData = await getMockChartData();
          await generateHeatMapData();
        }
        setData(getConfigData);
        const devicesData = getConfigData;
        devicesData?.map((item) => {
          devices += item.device + ';';
        });
        devices = devices.substring(0, devices.length - 1);
        dispatch(addDeviceNames(devices));
        if (!backend) {
          getRealtime();
        }
      } catch (err) {
        console.log('something went wrong' + err);
      } finally {
        console.log('done');
        // setIsLoading(false);
      }
    };
    getData();
  }, []);
  return (
    <div className={styles.container}>
      <Navbar />
      <Box sx={{display: 'flex'}} className={styles.loading_div}>
        {isLoading && <CircularProgress />}
      </Box>
    </div>
  );
};

export default Loading;
