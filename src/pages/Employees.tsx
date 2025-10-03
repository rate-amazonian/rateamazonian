import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { loadAmazonians, aggregateStats, getCategories } from "@/lib/data";

const ITEMS_PER_PAGE = 24;

const Employees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: allEmployees, isLoading } = useQuery({
    queryKey: ["allEmployees", categoryFilter],
    queryFn: async () => {
      // For "all", load executives as a default category to show something
      const category = categoryFilter === "all" ? "executives" : categoryFilter;
      const people = await loadAmazonians(category);
      return aggregateStats(people);
    },
  });

  const filteredEmployees = useMemo(() => {
    if (!allEmployees) return [];
    
    let filtered = allEmployees;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((emp: any) =>
        emp.full_name?.toLowerCase().includes(query) ||
        emp.job_title?.toLowerCase().includes(query) ||
        emp.department_name?.toLowerCase().includes(query) ||
        emp.username?.toLowerCase().includes(query)
      );
    }
    
    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((emp: any) => emp.department_name === departmentFilter);
    }
    
    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((emp: any) => emp.level?.toString() === levelFilter);
    }
    
    return filtered;
  }, [allEmployees, searchQuery, departmentFilter, levelFilter]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

  const departments = useMemo(() => {
    if (!allEmployees) return [];
    const depts = new Set(allEmployees.map((emp: any) => emp.department_name).filter(Boolean));
    return Array.from(depts).sort();
  }, [allEmployees]);

  const levels = useMemo(() => {
    if (!allEmployees) return [];
    const levels = new Set(allEmployees.map((emp: any) => emp.level).filter(l => l !== undefined));
    return Array.from(levels).sort((a, b) => (a as number) - (b as number));
  }, [allEmployees]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                All Amazonians ({filteredEmployees.length.toLocaleString()})
              </h1>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="flex gap-2 bg-muted/50 p-2 rounded-xl">
                <Input
                  placeholder="Search by name, title, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
                <Button size="icon" className="rounded-lg">
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.categories?.map((cat: any) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    L{level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="container mx-auto px-4 py-8">
        {paginatedEmployees.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedEmployees.map((employee: any) => (
                <Card
                  key={employee.username}
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(`/boss/${employee.username}`)}
                >
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {employee.photo_url ? (
                      <img
                        src={employee.photo_url}
                        alt={employee.full_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/30 flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary" />
                          </div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{employee.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {employee.job_title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3 truncate">
                      {employee.department_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {employee.average_rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ({employee.total_ratings} ratings)
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-2xl font-bold mb-2">No employees found</div>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
