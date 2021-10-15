import React, { Component } from 'react';

import mapPin from './assets/pin.svg';
import maptaskLogo from './assets/maptask.svg'

import './App.css';
import GoogleMapReact from 'google-map-react';
import { Button, message, Table, Input } from 'antd';

import { DownloadOutlined, SendOutlined, UserOutlined, CloudUploadOutlined } from '@ant-design/icons';


const Marker = ({ text }) =>
  <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
    <p style={{ color: 'brown', fontWeight: 'bold' }}>{text}</p>
    <img src={mapPin} className="App_pin" alt="pin" />
  </div>;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      response: '',
      post: '',
      responseToPost: '',
      lat: 43.65604614887085,
      lng: -79.38016603758616,
      task: {},
      taskIsComplete: false,
      completedBy: '',
      photoIsUploaded: false,
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
      lat: Number.parseFloat(task.lat),
      lng: Number.parseFloat(task.lng)
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
      lat: Number.parseFloat(task.lat),
      lng: Number.parseFloat(task.lng),
      taskIsComplete: true,
    });
    message.success('Successfully completed Task');
  };


  fixedColumns = [
    {
      title: 'Task Properties',
      dataIndex: 'prop',
      width: 150
    },
    {
      title: 'Values',
      dataIndex: "value",
    },
  ];

  render() {

    // deserialize state
    const { task, taskIsComplete, lat, lng, completedBy, photoIsUploaded } = this.state;
    console.log(lat, lng)
    const taskKeys = Object.keys(task)
    console.log(task)
    const fetchedTask = taskKeys.length > 0
    const fixedData = [];
    if (fetchedTask) {
      let index = 0;
      for (let key of taskKeys) {
        if (!taskIsComplete && key === 'completedBy' && task[key] === '00000000000000000000000000000000000000000000')
          continue;

        if (key === "image") {
          continue;
          // fixedData.push(
          //   {
          //     key: index,
          //     prop: key,
          //     value: "pothole.jpeg"
          //   }
          // )
        } else if (key === "desc") {
          fixedData.push(
            {
              key: index,
              prop: key,
              value: "Near Yonge and Dundas"
            }
          )
        }
        else {
          fixedData.push(
            {
              key: index,
              prop: key,
              value: task[key]
            }
          )
        }
        index++;
      }
    }

    return (
      <div className="App" >
        <div className="App_header">
          <img src={maptaskLogo} className="App-logo" alt="logo" />
        </div>
        <div className="App_body">
          <p className="App_welcome">MapTask Responder App</p>
          <div style={{ height: '44vh', width: '100%', marginTop: 20, marginBottom: 20 }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: "AIzaSyCcoqcaOgjLFn11SBa_bLziZviGja1zx4s" }}
              defaultCenter={{
                lat: 0,
                lng: 0
              }}
              defaultZoom={14}
              zoom={14}
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
                tableLayout='fixed'
                pagination={false}
                style={{ marginBottom: 20 }} />
            }

            {fetchedTask && !photoIsUploaded &&
              <Button
                type="dashed"
                shape="round"
                icon={<CloudUploadOutlined />}
                onClick={() => this.setState({ photoIsUploaded: true })}
                style={{ marginTop: 20 }}
              >
                Upload Photo Proof
              </Button>
            }

            {fetchedTask && photoIsUploaded &&
              < img src={"https://solutudo-cdn.s3-sa-east-1.amazonaws.com/prod/adv_ads/5e1f2e10-67b0-439f-871c-162dac1e0d51/5e8f5bd6-6910-4881-af11-3392ac1e02d3.jpg"} alt="pin" style={{ alignSelf: "center", width: 340, height: 340 }} />
            }


            {fetchedTask && !taskIsComplete &&
              <form>
                <p style={{ fontFamily: 'Montserrat', fontWeight: 'bold', fontSize: 16, color: '#2C405A', marginTop: 20 }}>Provide the name or solana address of whoever completed this task?</p>
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