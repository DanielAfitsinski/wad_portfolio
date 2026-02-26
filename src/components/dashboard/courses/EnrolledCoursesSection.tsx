// Section component for displaying all enrolled courses

import { useState, useMemo } from "react";
import type { EnrolledCourse } from "../../../types";
import { EnrolledCourseCard } from "./EnrolledCourseCard";

interface EnrolledCoursesSectionProps {
  courses: EnrolledCourse[];
  onUnenroll: (enrollmentId: number) => void;
}

export function EnrolledCoursesSection({
  courses,
  onUnenroll,
}: EnrolledCoursesSectionProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q
      ? courses
      : courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.instructor.toLowerCase().includes(q),
        );
  }, [courses, search]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Your Enrolled Courses</h2>

      {courses.length > 0 && (
        <div className="row g-2 mb-4">
          <div className="col-sm-8 col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title or instructor…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  title="Clear search"
                >
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!courses.length ? (
        <div className="alert alert-info">
          You're not enrolled in any courses yet.
        </div>
      ) : filtered.length ? (
        (() => {
          const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / PAGE_SIZE),
          );
          const safePage = Math.min(currentPage, totalPages);
          const paged = filtered.slice(
            (safePage - 1) * PAGE_SIZE,
            safePage * PAGE_SIZE,
          );
          return (
            <>
              <div className="row">
                {paged.map((course) => (
                  <EnrolledCourseCard
                    key={course.enrollmentId}
                    course={course}
                    onUnenroll={onUnenroll}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${safePage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(safePage - 1)}
                      >
                        <i className="bi bi-chevron-left" />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <li
                          key={p}
                          className={`page-item ${p === safePage ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </button>
                        </li>
                      ),
                    )}
                    <li
                      className={`page-item ${safePage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(safePage + 1)}
                      >
                        <i className="bi bi-chevron-right" />
                      </button>
                    </li>
                  </ul>
                  <p
                    className="text-center text-muted"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Showing {(safePage - 1) * PAGE_SIZE + 1}–
                    {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                    {filtered.length} courses
                  </p>
                </nav>
              )}
            </>
          );
        })()
      ) : (
        <div className="alert alert-secondary">
          No enrolled courses match your search.
        </div>
      )}
    </div>
  );
}
