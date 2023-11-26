import { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './Home.css';

import Join from '../Join/Join';
import CreateRoom from '../CreateRoom/CreateRoom';

const Home = () => {
    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <Tabs>
                    <TabList>
                        <Tab>
                            <h2 className='heading'>
                                Join
                            </h2>
                        </Tab>
                        <Tab>
                            <h2 className='heading'>
                                create
                            </h2>
                        </Tab>
                    </TabList>
                    {/* Join Panel */}
                    <TabPanel>
                        <Join />
                    </TabPanel>
                    {/* Create Room Panel */}
                    <TabPanel>
                        <CreateRoom />
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    )
}

export default Home