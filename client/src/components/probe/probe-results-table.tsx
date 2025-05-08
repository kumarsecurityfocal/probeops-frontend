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
          <TableRow>
            <TableHead>Date/Time</TableHead>
            <TableHead>Probe Type</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">
                {format(new Date(result.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>
                <Badge variant={getProbeTypeBadgeVariant(result.probeType)}>
                  {result.probeType}
                </Badge>
              </TableCell>
              <TableCell>{result.target}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(result.status)}>
                  {result.status === "success" ? "Success" : "Failed"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md truncate">
                {result.result || "No result"}
              </TableCell>
              <TableCell className="text-right">
                {onViewDetails && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewDetails(result)}
                    className="text-primary hover:text-indigo-900"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
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
