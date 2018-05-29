/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as util from "./common";

const unknown = "unknown";

/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
export class LinuxDistribution {
    public static GetCurrent(): Promise<LinuxDistribution> {
        // Try /etc/os-release and fallback to /usr/lib/os-release per the synopsis
        // at https://www.freedesktop.org/software/systemd/man/os-release.html.
        return LinuxDistribution.FromFilePath("/etc/os-release")
            .catch(() => LinuxDistribution.FromFilePath("/usr/lib/os-release"))
            .catch(() => Promise.resolve(new LinuxDistribution(unknown, unknown)));
    }

    public static FromReleaseInfo(releaseInfo: string, eol: string = os.EOL): LinuxDistribution {
        let name = unknown;
        let version = unknown;
        let idLike: string[] = null;

        const lines = releaseInfo.split(eol);
        for (let line of lines) {
            line = line.trim();

            const equalsIndex = line.indexOf("=");
            if (equalsIndex >= 0) {
                const key = line.substring(0, equalsIndex);
                let value = line.substring(equalsIndex + 1);

                // Strip double quotes if necessary
                if (value.length > 1 && value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length - 1);
                }

                if (key === "ID") {
                    name = value;
                } else if (key === "VERSION_ID") {
                    version = value;
                } else if (key === "ID_LIKE") {
                    idLike = value.split(" ");
                }

                if (name !== unknown && version !== unknown && idLike !== null) {
                    break;
                }
            }
        }

        return new LinuxDistribution(name, version, idLike);
    }

    private static FromFilePath(filePath: string): Promise<LinuxDistribution> {
        return new Promise<LinuxDistribution>((resolve, reject) => {
            fs.readFile(filePath, "utf8", (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(LinuxDistribution.FromReleaseInfo(data));
                }
            });
        });
    }

    public constructor(
        public name: string,
        public version: string,
        public idLike?: string[]) { }

    public toString(): string {
        return `name=${this.name}, version=${this.version}`;
    }

    /**
     * Returns a string representation of LinuxDistribution that only returns the
     * distro name if it appears on an allowed list of known distros. Otherwise,
     * it returns "other".
     */
    public toTelemetryString(): string {
        const allowedList = [
            "antergos", "arch", "centos", "debian", "deepin", "elementary", "fedora",
            "galliumos", "gentoo", "kali", "linuxmint", "manjoro", "neon", "opensuse",
            "parrot", "rhel", "ubuntu", "zorin",
        ];

        if (this.name === unknown || allowedList.indexOf(this.name) >= 0) {
            return this.toString();
        } else {
            // Having a hash of the name will be helpful to identify spikes in the "other"
            // bucket when a new distro becomes popular and needs to be added to the
            // allowed list above.
            const hash = crypto.createHash("sha256");
            hash.update(this.name);

            const hashedName = hash.digest("hex");

            return `other (${hashedName})`;
        }
    }
}
