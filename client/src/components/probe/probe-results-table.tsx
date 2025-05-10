import { ProbeResult } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProbeResultsTableProps {
  results: ProbeResult[];
  onViewDetails?: (result: ProbeResult) => void;
}

export function ProbeResultsTable({
  results,
  onViewDetails,
}: ProbeResultsTableProps) {
  if (!results.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No probe results found</p>
      </div>
    );
  }

  const getProbeTypeBadgeVariant = (
    probeType: string
  ): "ping" | "traceroute" | "dns" | "whois" => {
    switch (probeType) {
      case "ping":
        return "ping";
      case "traceroute":
        return "traceroute";
      case "dns":
        return "dns";
      case "whois":
        return "whois";
      default:
        return "ping";
    }
  };

  const getStatusBadgeVariant = (status: string): "success" | "error" => {
    return status === "success" ? "success" : "error";
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/50 bg-muted/30">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date/Time</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Probe Type</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Result</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow 
              key={result.id} 
              className="border-b border-border/20 hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-medium text-sm py-3">
                {format(new Date(result.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>
                <Badge variant={getProbeTypeBadgeVariant(result.probeType)}>
                  {result.probeType.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{result.target}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(result.status)}>
                  {result.status === "success" ? "Success" : "Failed"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground">
                {result.result || "No result"}
              </TableCell>
              <TableCell className="text-right">
                {onViewDetails && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(result)}
                    className="text-primary hover:text-primary-foreground hover:bg-primary transition-colors"
                  >
                    <EyeIcon className="h-3.5 w-3.5 mr-1" />
                    Details
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
