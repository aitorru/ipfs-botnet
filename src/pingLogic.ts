import axios from 'axios';

export default function pingL(url: string) {
  return setInterval(async () => {
    try {
      await axios.get(url);
    } catch (error) {
      console.error(error);
    }
  }, 500);
}