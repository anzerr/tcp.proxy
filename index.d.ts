declare module '@anzerr/tcp.proxy' {
    export class Proxy extends events {
        constructor(host: string, to: string)
        close(): Promise<void>
        public RX: string
        public TX: string
    }
}