import { Calendar, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyHistoryState({ onFindJobs }) {
    return (
        <Card className="relative overflow-hidden border-dashed border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 dark:from-slate-900/30 to-slate-100/30 dark:to-slate-900/10">
            {/* Remove absolute positioned blur elements if they cause overflow */}
            <CardContent className="relative z-10 flex flex-col items-center justify-center py-16 text-center px-4 sm:px-6">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Your Missions is Clear ✨
                </h3>

                <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed text-sm sm:text-base">
                    You don't have any upcoming missions. Start your earning
                    journey by accepting available opportunities!
                </p>

                <Button
                    onClick={onFindJobs}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg h-11 px-6 font-semibold rounded-lg group"
                >
                    <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Find Available Missions
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    );
}
