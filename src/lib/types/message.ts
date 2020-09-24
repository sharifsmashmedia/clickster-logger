export type Message = {
  readonly level: string;
  readonly item: string;
  readonly repeat: boolean;
  readonly topic: string;
  readonly date: Date;
  readonly hostname: string;
  readonly attachments: unknown;
  readonly stack: readonly string[];
};
