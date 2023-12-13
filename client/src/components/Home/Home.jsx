import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './Home.css';

import Join from '../Join/Join';
import CreateRoom from '../CreateRoom/CreateRoom';

const Home = () => {
    return (
        <div className="joinOuterContainer">
            <Tabs className="w-1/4">
                <TabList className="flex justify-between">
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
                <div className="joinInnerContainer ">
                    {/* Join Panel */}
                    <TabPanel>
                        <Join />
                    </TabPanel>
                    {/* Create Room Panel */}
                    <TabPanel>
                        <CreateRoom />
                    </TabPanel>
                </div>
            </Tabs>
        </div >
    )
}

export default Home