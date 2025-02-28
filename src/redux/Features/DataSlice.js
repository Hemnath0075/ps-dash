import {createSlice} from '@reduxjs/toolkit';

export const DataSlice = createSlice({
  name: 'data',
  initialState: {
    data: [],
    markers: [],
    devices: '',
    dashBoardRealtimeData: [],
    selectedDeviceData: [],
    comparisonChartData: [],
    backend: true,
  },
  reducers: {
    addData: (state, action) => {
      state.data = action.payload;
    },
    addMarkers: (state, action) => {
      action.payload.map((item) => {
        if (item.value && item.value.lat !== 0 && item.value.lon !== 0) {
          state.markers = [...state.markers, [item.value.lat, item.value.lon]];
        }
      });
    },
    updateData: (state, action) => {
      console.log(action.payload);
      // let index=action.payload.index;
      // state.data[index].value=action.payload.value
      state.data.map((item) => {
        action.payload.idata.map((item1) => {
          console.log(item1.data.dID == item.device);
          if (item1.data.dID == item.device) {
            console.log(item1.data);
            item.value = item1.data;
          }
        });
      });
    },
    addDeviceNames: (state, action) => {
      state.devices = action.payload;
    },
    dashboardData: (state, action) => {
      state.dashBoardRealtimeData = action.payload;
    },
    addSelectedDevice: (state, action) => {
      state.selectedDeviceData = [...state.selectedDeviceData, action.payload];
    },
    removeSelectedDevice: (state, action) => {
      const index = action.payload;
      if (index == 0) {
        state.selectedDeviceData.splice(0, 1);
      }
      state.selectedDeviceData.splice(index, index);
    },
    comparisonAddChartData: (state, action) => {
      state.comparisonChartData = action.payload;
    },
    removeComparisionChart: (state, action) => {
      const index = state.comparisonChartData.findIndex((item) => {
        return item.dID == action.payload;
      });
      console.log(index);
      if (index == 0) {
        state.comparisonChartData.splice(0, 1);
      }
      state.comparisonChartData.splice(index, index);
    },
    removeAllDevices: (state, action) => {
      state.selectedDeviceData = [];
      state.comparisonChartData = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addData,
  addDeviceNames,
  dashboardData,
  addSelectedDevice,
  removeSelectedDevice,
  comparisonAddChartData,
  removeComparisionChart,
  removeAllDevices,
  updateData,
  addMarkers,
} = DataSlice.actions;

export default DataSlice.reducer;
