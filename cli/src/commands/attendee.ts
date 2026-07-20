import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { EventOSClient } from '@eventos-ai/sdk';

export function attendeeCommand(getClient: () => EventOSClient): Command {
  const cmd = new Command('attendee').description('Manage attendees');

  cmd
    .command('list')
    .description('List attendees for an event')
    .argument('<eventId>', 'Event ID')
    .option('-s, --search <query>', 'Search by name or email')
    .option('-c, --checked', 'Filter by checked-in status')
    .option('-p, --page <page>', 'Page number', '1')
    .option('-l, --limit <limit>', 'Items per page', '20')
    .action(async (eventId: string, options) => {
      const spinner = ora('Loading attendees...').start();
      try {
        const client = getClient();
        const checkedIn = options.checked !== undefined ? options.checked === 'true' : undefined;
        const res = await client.checkin.listAttendees(eventId, {
          search: options.search,
          checkedIn,
          page: parseInt(options.page),
          limit: parseInt(options.limit),
        });
        spinner.stop();

        if (res.data.length === 0) {
          console.log(chalk.yellow('No attendees found'));
          return;
        }

        const table = new Table({
          head: ['Name', 'Email', 'Company', 'Checked In'],
          style: { head: ['cyan'] },
        });

        for (const attendee of res.data) {
          table.push([
            attendee.name.slice(0, 30),
            attendee.email.slice(0, 30),
            attendee.company?.slice(0, 20) || '-',
            attendee.checkedIn ? chalk.green('✓') : chalk.red('✗'),
          ]);
        }

        console.log(table.toString());
        console.log(chalk.dim(`\nPage ${options.page} (${res.total} total)`));
      } catch (err: unknown) {
        spinner.fail('Failed to load attendees');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('import')
    .description('Import attendees from a CSV file')
    .argument('<eventId>', 'Event ID')
    .argument('<file>', 'CSV file path')
    .action(async (eventId: string, filePath: string) => {
      const resolvedPath = path.resolve(filePath);

      if (!fs.existsSync(resolvedPath)) {
        console.log(chalk.red(`✗ File not found: ${resolvedPath}`));
        process.exit(1);
      }

      const spinner = ora('Reading CSV file...').start();
      try {
        const csvContent = fs.readFileSync(resolvedPath, 'utf-8');
        spinner.text = 'Importing attendees...';

        const client = getClient();
        const result = await client.checkin.importCSV(eventId, csvContent);

        spinner.succeed(chalk.green('Import completed'));
        console.log(`  Imported: ${chalk.green(result.imported.toString())}`);
        if (result.errors.length > 0) {
          console.log(chalk.yellow(`  Errors:   ${result.errors.length}`));
          for (const err of result.errors.slice(0, 5)) {
            console.log(chalk.dim(`    Row ${err.row}: ${err.message}`));
          }
          if (result.errors.length > 5) {
            console.log(chalk.dim(`    ... and ${result.errors.length - 5} more`));
          }
        }
      } catch (err: unknown) {
        spinner.fail('Import failed');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('export')
    .description('Export attendees to CSV or JSON')
    .argument('<eventId>', 'Event ID')
    .option('-f, --format <format>', 'Export format (json/csv)', 'csv')
    .option('-o, --output <file>', 'Output file path')
    .action(async (eventId: string, options) => {
      const spinner = ora('Exporting attendees...').start();
      try {
        const client = getClient();
        const blob = await client.checkin.exportAttendees(eventId, options.format);

        const outputPath = options.output || `attendees-${eventId.slice(0, 8)}.${options.format}`;
        const resolvedPath = path.resolve(outputPath);

        const buffer = Buffer.from(await blob.arrayBuffer());
        fs.writeFileSync(resolvedPath, buffer);

        spinner.succeed(chalk.green(`Exported to ${resolvedPath}`));
      } catch (err: unknown) {
        spinner.fail('Export failed');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  return cmd;
}
