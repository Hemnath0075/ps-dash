import React, {useEffect, useState} from 'react';
import kaatruLogo from '../assets/kaatru_logo.png';
import nseLogo from '../assets/nse.png';
import rbcdLogo from '../assets/rbcdsai_logo.png';
import iitLogo from '../assets/iitm_logo.png';
import styles from '../Pages/Dashboard/Dashboard.module.css';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
// import {AiOutlineMenu} from 'react-icons/ai';
import {AiOutlineClose} from 'react-icons/ai';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';

/**
 *
 * @return {NavbarComponent}
 */
function Navbar() {
  const [home, setHome]=useState(false);
  const [comparison, setComparison]=useState(false);
  const navigate=useNavigate();
  const [status, setState] = React.useState(false);
  const marker = useSelector((state) => state.data.markers);
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState(!status);
  };
  useEffect(()=>{
    if (window.location.pathname=='/home') {
      console.log('true');
      setHome(true);
      setComparison(false);
    } else {
      setHome(false);
      setComparison(true);
    }
    console.log(window.location.pathname);
  }, []);
  const list = (anchor) => (
    <div style={{backgroundColor: 'black', height: '100%'}}>
      <img
        src={kaatruLogo}
        alt=""
        width={'150px'}
        style={{marginLeft: '20px', marginTop: '5%'}}
        className={styles.navbar_logo}
      />
      <AiOutlineClose
        className={styles.close_icon}
        fill="white"
        onClick={toggleDrawer(true)}
      />
      <Box
        sx={{width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 300}}
        role="presentation"
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
        className={styles.sidebar}
      >
        <List className={`${home && styles.menu_active}`}>
          <ListItem disablePadding>
            <ListItemText
              primary={'Home'}
              className={`${home && styles.menu_active} ${styles.sidebar_text}`}
              onClick={() => navigate('/home')}
            />
          </ListItem>
        </List>
        <Divider />
        <List className={`${comparison && styles.menu_active}`}>
          <ListItem disablePadding>
            <ListItemText
              primary={'Comparison'}
              className={`${comparison && styles.menu_active} 
              ${styles.sidebar_text}`}
              onClick={() => {
                if (marker.length>0) {
                  navigate('/comparison');
                } else {
                  navigate('/error');
                }
              }}
            />
          </ListItem>
        </List>
      </Box>
    </div>
  );
  return (
    <>
      <Drawer open={status} onClose={toggleDrawer(false)}>
        {list('left')}
      </Drawer>
      <div className={styles.navbar}>
        <div className={styles.left_navbar}>
          {/* <AiOutlineMenu
            className={styles.menu_icon}
            fill="white"
            onClick={toggleDrawer(true)}
          /> */}
          <img src={kaatruLogo} alt="" width={'170vw'} />
        </div>
        <div className={styles.center_navbar}>
          <h2 className={styles.heading}>
            KAATRU AIR QUALITY DASHBOARD
          </h2>

        </div>
        <div className={styles.right_navbar}>
          <div>
            <img src={iitLogo} alt="" width={'70vw'} />
          </div>
          <div>
            <img src={nseLogo} alt="" width={'120vw'} />
          </div>
          <div>
            <img src={rbcdLogo} alt="" width={'70vw'} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
