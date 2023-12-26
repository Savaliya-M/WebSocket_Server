import { Injectable } from '@nestjs/common';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
import axios from 'axios';

@Injectable()
export class SocketService {
  
  async loginToDirectus() {
    try {

      const url = `${process.env.DIRECTUS_BASE_URL}/auth/login`;
      
      const data = {
        email: process.env.DIRECTUS_USERNAME,
        password: process.env.DIRECTUS_PASSWORD,
      };

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response) {
        const authToken = response.data.data.access_token;
        return authToken;
      } else {
        console.error('Error:', response.status, response.statusText);
      }
  
     
    } catch (error) {
      console.error('Error logging in to Directus:', error.message);
      throw error;
    }
  }

  async authenticate(data:{email: string, password: string}){
    const { email, password } = data;
  const usersEndpoint = `http://localhost:8055/items/users?filter[email][_eq]=${email}`;

  try {
    const fetchResponse = await fetch(usersEndpoint, {
      method: 'GET', 
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(fetchResponse);
    
    const users = await fetchResponse.json();

    const user = users.data[0];

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const passwordMatches = user.password === password;

    if (!passwordMatches) {
      return { success: false, message: 'Incorrect password' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error during authentication:', error);
    return { success: false, message: 'Authentication failed' };
  }
  }

  async insertData(data: {command: string,Task_id: string,sender: string,receiver: string}) {
    console.log(data);
    const token = await this.loginToDirectus();
  console.log(token);

    try {
      const response = await axios.post(
        `${process.env.DIRECTUS_BASE_URL}/items/Task_Master`, 
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('Data stored in Directus:', response.data);
    } catch (error) {
      console.error('Error storing data in Directus:', error.message);
      throw error;
    }
    return 'This action adds a new socket';
  }

  async updateData(data:{Task_id: string,response:string,Task_done_timestamp:string}) {
    const token = await this.loginToDirectus();
    const{Task_id:taskid,response:result,Task_done_timestamp:timestamp} =data;

const fetchUrl = `http://localhost:8055/items/Task_Master?filter[Task_id][_eq]=${taskid}`;
const fetchResponse = await fetch(fetchUrl, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (!fetchResponse.ok) {
  throw new Error(`Failed to fetch all records. Status: ${fetchResponse.status}`);
}

const Records = await fetchResponse.json();

const recordId = Records.data[0].id;

const updateUrl = `http://localhost:8055/items/Task_Master/${recordId}`;
const updateResponse = await fetch(updateUrl, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    
      response: result,
      Task_done_timestamp: timestamp,
    
  }),
});

if (!updateResponse.ok) {
  throw new Error(`Failed to update record. Status: ${updateResponse.status}`);
}

const updateData = await updateResponse.json();
console.log('Update success:', updateData);
return updateData;
  }

  addevent(data:{event: string,taskid:string}) {
    console.log(data, "data of event");
    
  }

}
