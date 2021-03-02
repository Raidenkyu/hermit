import { execSync } from 'child_process';

import Syscall from '../utils/lib/Syscall';
import { readDebianPackages, readPythonPackages } from '../utils/fileSystem';

const getPackageName = (library: string) => {
  try {
    const packageName: string = execSync(`dpkg -S ${library}`, { stdio: 'pipe', encoding: 'utf-8' }).split(':')[0];

    return packageName;
  }
  catch (e) { }

  try {
    const packageName: string = execSync(`dpkg -S "$(readlink -f ${library})"`, { stdio: 'pipe', encoding: 'utf-8' }).split(':')[0];

    return packageName;
  }
  catch (e2) { }
  return null;
}

const isLibrary = (fileName: string) => {
  return fileName.split('.').includes('so') && !fileName.includes('python');
}

const filterPackages = (packagesList: Array<string>) => {
  const installablePackages: Array<string> = new Array<string>();
  const filteredPackages: Array<string> = new Array<string>();

  const debianPackages: Array<string> = readDebianPackages();
  const pythonpackages: Array<string> = readPythonPackages();

  let packagesCount: number = packagesList.length;

  for (let i = 0; i < debianPackages.length; i++) {
    const debianPackage = debianPackages[i];

    if (packagesList.includes(debianPackage)) {
      installablePackages.push(debianPackage);
      packagesCount--;

      if (packagesCount == 0) break;
    }
  }

  installablePackages.forEach((dep) => {
    if (!pythonpackages.includes(dep)) {
      filteredPackages.push(dep);
    }
  });

  return filteredPackages;
}

const dependenciesModule = (syscalls: Array<Syscall>, installationSteps: Array<string>) => {
  const analyzedDependencies: Array<string> = new Array<string>()
  const languageDependencies: Array<string> = new Array<string>()
  const systemDependencies: Array<string> = new Array<string>()

  syscalls.forEach((call) => {
    const fileName: string = call.args[1];

    if (analyzedDependencies.includes(fileName)) return;

    if (isLibrary(fileName)) {
      const packageName: string | null = getPackageName(fileName);

      if (packageName != null && !systemDependencies.includes(packageName)) {
        systemDependencies.push(packageName);
        console.log(`Package detected: ${packageName}`);
      }
    }
    else {
      languageDependencies.push(fileName);
    }

    analyzedDependencies.push(fileName);
  });

  return {
    languagueDependencies: installationSteps,
    systemDependencies: filterPackages(systemDependencies)
  }
}

export default dependenciesModule;