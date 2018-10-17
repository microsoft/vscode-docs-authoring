export class XrefInfo {
    public name: string;
    public fullName: string;
    public href: string;
    public etag: string;
     public constructor(name: string, fullName: string, href: string, etag: string) {
        this.name = name;
        this.fullName = fullName;
        this.href = href;
        this.etag = etag;
    }
}