import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';
import Syscall from '../utils/lib/Syscall';


const portsModule = (_inspectedData: SourceInfo, tracedData: SystemInfo, _languageData: any): Array<number> => {
  const syscalls: Array<Syscall> = tracedData.bind;
  const portsData: Array<number> = new Array<number>()

  syscalls.forEach((call) => {

    const portData = call.args[1]['sin6_port'];
    if (portData == undefined) return;

    const port: number = portData.params[0]
    portsData.push(port);

  });

  return portsData;
}

export default portsModule;