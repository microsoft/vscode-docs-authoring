import { LinuxDistribution } from './platform';
import { execChildProcess, execPromise } from './common';
import os = require('os');
export class PlatformInformation {
	public constructor(
		public platform: string,
		public architecture: string,
		public distribution: LinuxDistribution = null
	) {}

	public static GetCurrent(): Promise<PlatformInformation> {
		const platform = os.platform();
		let architecturePromise: Promise<string>;
		let distributionPromise: Promise<LinuxDistribution>;

		switch (platform) {
			case 'win32':
				architecturePromise = PlatformInformation.GetWindowsArchitecture();
				distributionPromise = Promise.resolve(null);
				break;

			case 'darwin':
				architecturePromise = PlatformInformation.GetUnixArchitecture();
				distributionPromise = Promise.resolve(null);
				break;

			case 'linux':
				architecturePromise = PlatformInformation.GetUnixArchitecture();
				distributionPromise = LinuxDistribution.GetCurrent();
				break;

			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		return Promise.all<any>([architecturePromise, distributionPromise]).then(([arch, distro]) => {
			return new PlatformInformation(platform, arch, distro);
		});
	}

	private static GetWindowsArchitecture(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (
				process.env.PROCESSOR_ARCHITECTURE === 'x86' &&
				process.env.PROCESSOR_ARCHITEW6432 === undefined
			) {
				resolve('x86');
			} else {
				resolve('x86_64');
			}
		});
	}

	private static GetUnixArchitecture(): Promise<string> {
		return execChildProcess('uname -m').then(architecture => {
			if (architecture) {
				return architecture.trim();
			}

			return null;
		});
	}

	public isWindows(): boolean {
		return this.platform === 'win32';
	}

	public isMacOS(): boolean {
		return this.platform === 'darwin';
	}

	public isLinux(): boolean {
		return this.platform === 'linux';
	}

	public toString(): string {
		let result = this.platform;

		if (this.architecture) {
			if (result) {
				result += ', ';
			}

			result += this.architecture;
		}

		if (this.distribution) {
			if (result) {
				result += ', ';
			}

			result += this.distribution.toString();
		}

		return result;
	}
}

export async function openFolderInExplorerOrFinder(path: string) {
	const platform = await PlatformInformation.GetCurrent();
	if (platform.isWindows()) {
		const command = `%SystemRoot%\\explorer.exe ${path}`;
		await execPromise(command);
	} else {
		const command = `open "${path}"`;
		await execPromise(command);
	}
}
