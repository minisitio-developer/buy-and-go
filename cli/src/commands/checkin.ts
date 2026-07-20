import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { EventOSClient } from '@eventos-ai/sdk';

export function checkinCommand(getClient: () => EventOSClient): Command {
  const cmd = new Command('checkin').description('Manage check-ins');

  cmd
    .command('stats')
    .description('Show check-in statistics for an event')
    .argument('<eventId>', 'Event ID')
    .action(async (eventId: string) => {
      const spinner = ora('Loading statistics...').start();
      try {
        const client = getClient();
        const stats = await client.checkin.getStats(eventId);
        spinner.stop();

        console.log(chalk.bold('\nCheck-in Statistics\n'));
        console.log('─'.repeat(50));

        const table = new Table({
          style: { head: ['cyan'] },
          colWidths: [20, 15],
        });

        table.push(
          [chalk.dim('Total Attendees'), chalk.white(stats.totalAttendees.toString())],
          [chalk.dim('Checked In'), chalk.green(stats.checkedIn.toString())],
          [chalk.dim('Pending'), chalk.yellow(stats.pending.toString())],
          [chalk.dim('Check-in Rate'), chalk.cyan(`${(stats.checkinRate * 100).toFixed(1)}%`)]
        );

        console.log(table.toString());

        if (stats.byMethod) {
          console.log(chalk.bold('\nBy Method'));
          const methodTable = new Table({
            head: ['Method', 'Count'],
            style: { head: ['cyan'] },
          });
          for (const [method, count] of Object.entries(stats.byMethod)) {
            methodTable.push([method, count.toString()]);
          }
          console.log(methodTable.toString());
        }
      } catch (err: unknown) {
        spinner.fail('Failed to load statistics');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('manual')
    .description('Manually check in an attendee')
    .argument('<eventId>', 'Event ID')
    .argument('<ticketCode>', 'Ticket code')
    .action(async (eventId: string, ticketCode: string) => {
      const spinner = ora('Processing check-in...').start();
      try {
        const client = getClient();
        const result = await client.checkin.checkin({
          eventId,
          ticketCode,
          method: 'manual',
        });
        spinner.succeed(chalk.green('Check-in successful'));
        console.log(`  Ticket: ${chalk.cyan(ticketCode)}`);
        console.log(`  Time:   ${chalk.dim(new Date(result.timestamp).toLocaleString())}`);
      } catch (err: unknown) {
        spinner.fail('Check-in failed');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('list')
    .description('List recent check-ins')
    .argument('<eventId>', 'Event ID')
    .option('-l, --limit <limit>', 'Number of check-ins', '20')
    .option('-m, --method <method>', 'Filter by method')
    .action(async (eventId: string, options) => {
      const spinner = ora('Loading check-ins...').start();
      try {
        const client = getClient();
        const res = await client.checkin.listCheckins(eventId, {
          limit: parseInt(options.limit),
          method: options.method,
        });
        spinner.stop();

        if (res.data.length === 0) {
          console.log(chalk.yellow('No check-ins found'));
          return;
        }

        const table = new Table({
          head: ['Time', 'Ticket', 'Method'],
          style: { head: ['cyan'] },
        });

        for (const checkin of res.data) {
          table.push([
            new Date(checkin.timestamp).toLocaleString(),
            checkin.ticketCode.slice(-10).toUpperCase(),
            checkin.method,
          ]);
        }

        console.log(table.toString());
        console.log(chalk.dim(`\n${res.total} total check-ins`));
      } catch (err: unknown) {
        spinner.fail('Failed to load check-ins');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  return cmd;
}
