import React, { Component } from 'react';

import mapPin from './assets/pin.svg';
import maptaskLogo from './assets/maptask.svg'

import './App.css';
import GoogleMapReact from 'google-map-react';
import { Button, message, Table, Input } from 'antd';

import { DownloadOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';


const Marker = ({ text }) =>
  <div>
    {text}
    <img src={mapPin} className="App_pin" alt="pin" />
  </div>;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      response: '',
      post: '',
      responseToPost: '',
      lat: 43.65737242113442,
      lng: -79.38267843068441,
      task: {},
      taskIsComplete: false,
      completedBy: ''
    };

    this.fetchTask = this.fetchTask.bind(this);
    this.completeTask = this.completeTask.bind(this);
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  fetchTask = async e => {
    e.preventDefault();
    const response = await fetch('/api/fetchTask');
    const body = await response.text();
    const task = JSON.parse(body);
    this.setState({
      responseToPost: body,
      task,
      lat: Number.parseInt(task.lat),
      lng: Number.parseInt(task.lng)
    });
  };

  completeTask = async e => {
    e.preventDefault();
    const response = await fetch('/api/completeTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completedBy: this.state.completedBy }),
    });
    const body = await response.text();
    const task = JSON.parse(body);
    this.setState({
      responseToPost: body,
      task,
      lat: Number.parseInt(task.lat),
      lng: Number.parseInt(task.lng),
      taskIsComplete: true,
    });
    message.success('Successfully completed Task');
  };


  fixedColumns = [
    {
      title: 'Task Properties',
      dataIndex: 'prop',
    },
    {
      title: 'Values',
      dataIndex: "value",
    },
  ];

  render() {

    // deserialize state
    const { task, taskIsComplete, lat, lng, completedBy } = this.state;
    const taskKeys = Object.keys(task)
    console.log(task)
    const fetchedTask = taskKeys.length > 0
    const fixedData = [];
    if (fetchedTask) {
      let index = 0;
      for (let key of taskKeys) {
        console.log("key is ", key)
        if (!taskIsComplete && key === 'completedBy' && task[key] === '00000000000000000000000000000000000000000000')
          continue;

        fixedData.push(
          {
            key: index,
            prop: key,
            value: task[key]
          }
        )
        index++;
      }
    }

    console.log(fixedData);

    return (
      <div className="App" >
        <div className="App_header">
          <img src={maptaskLogo} className="App-logo" alt="logo" />
        </div>
        <div className="App_body">
          <p className="App_welcome"> Welcome to the MapTask App</p>
          <div style={{ height: '44vh', width: '100%', marginTop: 20, marginBottom: 20 }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: "AIzaSyCcoqcaOgjLFn11SBa_bLziZviGja1zx4s" }}
              defaultCenter={{
                lat: 0,
                lng: 0
              }}
              defaultZoom={15}
              zoom={15}
              center={{ lat, lng }}>
              {fetchedTask && <Marker
                lat={lat}
                lng={lng}
                text={task.name} />}
            </GoogleMapReact>
          </div>
          <div style={{ display: 'flex', flexDirection: "column" }}>
            {!fetchedTask && <Button type='default'
              shape="round"
              icon={<DownloadOutlined />}
              onClick={this.fetchTask}
              style={{ marginBottom: 20 }}>
              Download Task
            </Button>}
            {fetchedTask &&
              <Table
                columns={this.fixedColumns}
                dataSource={fixedData}
                bordered
                tableLayout='fixed' />}

            {fetchedTask && !taskIsComplete &&
              <form>
                <p>Provide the name or solana address of whoever completed this task?</p>
                <div>
                  <Input
                    placeholder="name or address of completer"
                    prefix={<UserOutlined />}
                    value={completedBy}
                    onChange={e => this.setState({ completedBy: e.target.value })} />
                </div>
                {fetchedTask &&
                  <Button
                    type="primary"
                    shape="round"
                    icon={<SendOutlined />}
                    onClick={this.completeTask}
                    style={{ marginTop: 20 }}
                  >
                    Mark Task as Done!
                  </Button>}
              </form>}
          </div>
        </div>
      </div>
    );
  }
}

export default App;