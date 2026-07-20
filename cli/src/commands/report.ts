import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { EventOSClient } from '@eventos-ai/sdk';

export function reportCommand(getClient: () => EventOSClient): Command {
  const cmd = new Command('report').description('Generate reports');

  cmd
    .command('generate')
    .description('Generate an event report')
    .argument('<eventId>', 'Event ID')
    .argument('[format]', 'Output format (json/csv)', 'json')
    .option('-o, --output <file>', 'Output file path')
    .action(async (eventId: string, format: string, options) => {
      const spinner = ora('Generating report...').start();
      try {
        const client = getClient();
        const [stats, attendeesRes] = await Promise.all([
          client.checkin.getStats(eventId),
          client.checkin.listAttendees(eventId, { limit: 10000 }),
        ]);

        const report = {
          eventId,
          generatedAt: new Date().toISOString(),
          statistics: {
            totalAttendees: stats.totalAttendees,
            checkedIn: stats.checkedIn,
            pending: stats.pending,
            checkinRate: stats.checkinRate,
            byMethod: stats.byMethod,
          },
          attendees: attendeesRes.data.map((a) => ({
            name: a.name,
            email: a.email,
            company: a.company,
            checkedIn: a.checkedIn,
            checkedInAt: a.checkedInAt,
          })),
        };

        spinner.stop();

        const ext = format === 'csv' ? 'csv' : 'json';
        const outputPath = options.output
          ? path.resolve(options.output)
          : path.resolve(`report-${eventId.slice(0, 8)}.${ext}`);

        if (format === 'csv') {
          const csvLines = ['name,email,company,checkedIn,checkedInAt'];
          for (const a of report.attendees) {
            csvLines.push(`${a.name},${a.email},${a.company || ''},${a.checkedIn},${a.checkedInAt || ''}`);
          }
          fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf-8');
        } else {
          fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
        }

        console.log(chalk.green(`✓ Report saved to ${outputPath}`));
        console.log(chalk.dim(`  ${report.attendees.length} attendees | ${(stats.checkinRate * 100).toFixed(1)}% check-in rate`));
      } catch (err: unknown) {
        spinner.fail('Report generation failed');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  return cmd;
}
