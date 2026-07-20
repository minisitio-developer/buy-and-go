#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import Conf from 'conf';
import { EventOSClient } from '@eventos-ai/sdk';
import { eventsCommand } from './commands/events';
import { checkinCommand } from './commands/checkin';
import { attendeeCommand } from './commands/attendee';
import { reportCommand } from './commands/report';
import { crmCommand } from './commands/crm';
import { sponsorsCommand } from './commands/sponsors';

const config = new Conf({ projectName: 'eventos-cli' });
const API_BASE_URL = process.env.EVENTOS_API_URL || 'http://localhost:3000/api';

function getClient(): EventOSClient {
  const token = config.get('token') as string | undefined;
  return new EventOSClient({
    baseURL: API_BASE_URL,
    ...(token ? { token } : {}),
  });
}

const program = new Command();

program
  .name('eventos')
  .description('EventOS AI - Event management CLI')
  .version('1.0.0');

program
  .command('login')
  .description('Authenticate with EventOS')
  .argument('<email>', 'User email')
  .argument('<password>', 'User password')
  .action(async (email: string, password: string) => {
    try {
      const client = getClient();
      await client.authenticate(email, password);
      const token = client.getToken();
      if (token) {
        config.set('token', token);
        console.log(chalk.green('✓ Login successful'));
      } else {
        console.log(chalk.red('✗ Login failed: no token received'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      console.log(chalk.red(`✗ ${message}`));
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Clear saved authentication')
  .action(() => {
    config.delete('token');
    console.log(chalk.green('✓ Logged out'));
  });

program.addCommand(eventsCommand(getClient));
program.addCommand(checkinCommand(getClient));
program.addCommand(attendeeCommand(getClient));
program.addCommand(reportCommand(getClient));
program.addCommand(crmCommand(getClient));
program.addCommand(sponsorsCommand(getClient));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
