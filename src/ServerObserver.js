class ServerObserver {
  _subscribers = {};
  _url = '';
  _connection = null;
  _request_id = 0;
  _request_waiters = {};
  _chan_susbscriptions = {};
  _b_close = false;
  _connection_closed = true;



  static  _thisClass = null;
  static getInstance()
  {
    if(this._thisClass === null)
    {
        console.log('created new');
        this._thisClass = new ServerObserver();
    }
    return this._thisClass;
  }

  sendData(data)
  {
    this._request_id++;
    this._connection.send( JSON.stringify( data ) );
  }

  callMethod(method,params,cb = null)
  {
    this._request_id++;
    console.log(method, params);
    this._connection.send( JSON.stringify({ method, request_id: this._request_id, params }) );
    if ( typeof cb === 'function')
    {
      this._request_waiters['request_' + this._request_id] = cb;
    }
  }

  callMethodAsync(method,params)
  {
    console.log(method,params);
    const thisClass = this;
    return new Promise((resolve,reject) => {
      thisClass.callMethod(method, params, (result) => {
        if (result.result === -1) {
          reject(result)
        }
        else
        {
          resolve(result);
        }
      })
    });
  }

  connect()
  {
    return new Promise((resolve,reject)=>{

      if( !this._connection_closed )
      {
        resolve();
        return;
      }

      this._connection = new WebSocket(this._url);
      this._connection.onopen = (event)=> {
        this.observe('open',null);
        this._connection_closed = false;
        resolve();
      };
      this._b_close = false;

      const thisCass = this;

      this._connection.onmessage = (event) => {
        console.log( event.data );
        let json = JSON.parse(event.data);
        if( this._request_waiters.hasOwnProperty('request_' + json.request_id ) )
        {
          //console.log('this_is_callback');
          const cb = this._request_waiters['request_' + json.request_id];
          try{ cb(json); } catch {}
          delete this._request_waiters['request_' + json.request_id];
        }

        if( json.method === "channel" )
        {
          this.observerChannel(json.channel_id, json.type, json.data)
        }
        else {
          this.observe(json.method, json.data || json.params);
        }
      };

      this._connection.onclose = () => {
        this._connection_closed = true;
        if (!this._b_close)
          setTimeout(()=> {
            thisCass.connect();
          }, 1000);
      }

    })
  }

  resetSubscriptions(){
    this._subscribers = {};
    this._request_waiters = {};
    this._chan_susbscriptions = {};
  }

  observerChannel(channelId, type, data)
  {
    if( this._chan_susbscriptions.hasOwnProperty('c_' + channelId) ) {
      const cb = this._chan_susbscriptions['c_' + channelId];
        try { cb(channelId,type,data); } catch {}
    }
  }

  async setServer(url)
  {
      this._url = url;
      await this.connect();
  }

  isClosed()
  {
    return this._connection_closed;
  }

  subscribe(event,cb)
  {
    if(!this._subscribers.hasOwnProperty(event))
      this._subscribers[event] = [];

    this._subscribers[event].push(cb);
    console.log('subscribed to ', event);
  }

  subscribeR(events,cb)
  {
    events.forEach((event)=>{
      if(!this._subscribers.hasOwnProperty(event))
        this._subscribers[event] = [];

      this._subscribers[event].push(cb);
      console.log('subscribed to ', event);
    });
  }

  subscribeChannel(channelId,cb)
  {
      if ( !this._chan_susbscriptions.hasOwnProperty('c_' + channelId) )
        this._chan_susbscriptions['c_' + channelId] = null;

      this._chan_susbscriptions['c_' + channelId] = cb;
  }

  init_connection(url)
  {

  }

  close()
  {
    this._b_close =true;
    this._connection.close();
  }

  observe(event,data)
  {
    //console.log(this._subscribers);
    if(!this._subscribers.hasOwnProperty(event))
       return;

    this._subscribers[event].forEach((cb,index)=>{
      try
      {
        cb(event,data);
      }
      catch(err)
      {
        console.log(err);
        this._subscribers.splice(index,1);
      }
    })
  }
}

export default ServerObserver;

export function getSocket(){
  return ServerObserver.getInstance();
}
