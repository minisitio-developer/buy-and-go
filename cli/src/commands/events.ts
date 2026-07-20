import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { EventOSClient } from '@eventos-ai/sdk';

export function eventsCommand(getClient: () => EventOSClient): Command {
  const cmd = new Command('events').description('Manage events');

  cmd
    .command('list')
    .description('List all events')
    .option('-s, --status <status>', 'Filter by status')
    .option('-p, --page <page>', 'Page number', '1')
    .option('-l, --limit <limit>', 'Items per page', '20')
    .action(async (options) => {
      const spinner = ora('Loading events...').start();
      try {
        const client = getClient();
        const res = await client.events.list({
          status: options.status,
          page: parseInt(options.page),
          limit: parseInt(options.limit),
        });

        spinner.stop();

        if (res.data.length === 0) {
          console.log(chalk.yellow('No events found'));
          return;
        }

        const table = new Table({
          head: ['ID', 'Name', 'Status', 'Start', 'End', 'Location'],
          style: { head: ['cyan'] },
        });

        for (const event of res.data) {
          table.push([
            event.id.slice(0, 8),
            event.name.slice(0, 40),
            statusBadge(event.status),
            new Date(event.startDate).toLocaleDateString(),
            new Date(event.endDate).toLocaleDateString(),
            event.location?.slice(0, 20) || '-',
          ]);
        }

        console.log(table.toString());
        console.log(chalk.dim(`\nPage ${res.page}/${Math.ceil(res.total / res.limit)} (${res.total} total)`));
      } catch (err: unknown) {
        spinner.fail('Failed to load events');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('get')
    .description('Get event details')
    .argument('<id>', 'Event ID or slug')
    .action(async (id: string) => {
      const spinner = ora('Loading event...').start();
      try {
        const client = getClient();
        const event = id.length === 36 ? await client.events.getById(id) : await client.events.getBySlug(id);
        spinner.stop();

        console.log(chalk.bold('\nEvent Details'));
        console.log('─'.repeat(50));
        console.log(`${chalk.dim('ID:')}       ${event.id}`);
        console.log(`${chalk.dim('Name:')}     ${event.name}`);
        console.log(`${chalk.dim('Slug:')}     ${event.slug}`);
        console.log(`${chalk.dim('Status:')}   ${statusBadge(event.status)}`);
        console.log(`${chalk.dim('Start:')}    ${new Date(event.startDate).toLocaleString()}`);
        console.log(`${chalk.dim('End:')}      ${new Date(event.endDate).toLocaleString()}`);
        console.log(`${chalk.dim('Location:')} ${event.location || '-'}`);
        console.log(`${chalk.dim('Capacity:')} ${event.maxAttendees || 'Unlimited'}`);
      } catch (err: unknown) {
        spinner.fail('Failed to load event');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('create')
    .description('Create a new event')
    .requiredOption('-n, --name <name>', 'Event name')
    .option('-d, --description <description>', 'Event description')
    .option('-l, --location <location>', 'Event location')
    .requiredOption('-s, --start <date>', 'Start date (ISO 8601)')
    .requiredOption('-e, --end <date>', 'End date (ISO 8601)')
    .option('-t, --timezone <timezone>', 'Timezone', 'America/Sao_Paulo')
    .option('-c, --capacity <number>', 'Maximum attendees')
    .option('--visibility <visibility>', 'Visibility (public/private/invite_only)', 'public')
    .action(async (options) => {
      const spinner = ora('Creating event...').start();
      try {
        const client = getClient();
        const event = await client.events.create({
          name: options.name,
          description: options.description,
          location: options.location,
          startDate: options.start,
          endDate: options.end,
          timezone: options.timezone,
          maxAttendees: options.capacity ? parseInt(options.capacity) : undefined,
          visibility: options.visibility,
        });
        spinner.succeed(chalk.green('Event created'));
        console.log(`  ID: ${chalk.cyan(event.id)}`);
        console.log(`  Slug: ${chalk.cyan(event.slug)}`);
      } catch (err: unknown) {
        spinner.fail('Failed to create event');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('delete')
    .description('Delete an event')
    .argument('<id>', 'Event ID')
    .action(async (id: string) => {
      const spinner = ora('Deleting event...').start();
      try {
        const client = getClient();
        await client.events.delete(id);
        spinner.succeed(chalk.green('Event deleted'));
      } catch (err: unknown) {
        spinner.fail('Failed to delete event');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  return cmd;
}

function statusBadge(status: string): string {
  const colors: Record<string, (s: string) => string> = {
    draft: chalk.gray,
    published: chalk.green,
    ongoing: chalk.blue,
    completed: chalk.dim,
    cancelled: chalk.red,
  };
  return (colors[status] || chalk.white)(status);
}
